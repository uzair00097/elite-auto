import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, func, select

from app.api.deps import get_current_user
from app.core.embeddings import embed_vehicle
from app.db.session import get_session
from app.models.user import User
from app.models.vehicle import Vehicle, VehicleCategory, VehicleEmbedding, VehicleImage, VehicleStatus
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleImageResponse,
    VehicleListResponse,
    VehicleResponse,
    VehicleUpdate,
)

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


def slugify(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{base}-{uuid.uuid4().hex[:6]}"


def upsert_embedding(vehicle: Vehicle, session: Session) -> None:
    vector = embed_vehicle(vehicle)
    existing = session.exec(
        select(VehicleEmbedding).where(VehicleEmbedding.vehicle_id == vehicle.id)
    ).first()
    if existing:
        existing.embedding = vector
        session.add(existing)
    else:
        session.add(VehicleEmbedding(vehicle_id=vehicle.id, embedding=vector))
    session.commit()


def to_response_many(vehicles: list[Vehicle], session: Session) -> list[VehicleResponse]:
    """Batch-builds responses for a list of vehicles with exactly 2 extra queries total
    (all images + all sellers), instead of 2 queries per vehicle (N+1)."""
    if not vehicles:
        return []

    vehicle_ids = [v.id for v in vehicles]
    seller_ids = list({v.seller_id for v in vehicles})

    images = session.exec(
        select(VehicleImage)
        .where(VehicleImage.vehicle_id.in_(vehicle_ids))
        .order_by(VehicleImage.sort_order)
    ).all()
    images_by_vehicle: dict[int, list[VehicleImage]] = {}
    for img in images:
        images_by_vehicle.setdefault(img.vehicle_id, []).append(img)

    sellers = session.exec(select(User).where(User.id.in_(seller_ids))).all()
    sellers_by_id = {s.id: s for s in sellers}

    responses = []
    for vehicle in vehicles:
        seller = sellers_by_id.get(vehicle.seller_id)
        responses.append(
            VehicleResponse(
                **vehicle.model_dump(),
                images=[
                    VehicleImageResponse.model_validate(img)
                    for img in images_by_vehicle.get(vehicle.id, [])
                ],
                seller_name=seller.name if seller else "Unknown seller",
                seller_phone=seller.phone if seller else None,
                seller_verified=bool(seller and seller.phone_verified),
            )
        )
    return responses


def to_response(vehicle: Vehicle, session: Session) -> VehicleResponse:
    return to_response_many([vehicle], session)[0]


@router.post("", response_model=VehicleResponse, status_code=201)
def create_vehicle(
    payload: VehicleCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    vehicle = Vehicle(
        seller_id=current_user.id,
        slug=slugify(payload.title),
        **payload.model_dump(),
    )
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    upsert_embedding(vehicle, session)
    return to_response(vehicle, session)


@router.get("", response_model=VehicleListResponse)
def list_vehicles(
    session: Session = Depends(get_session),
    category: VehicleCategory | None = None,
    city: str | None = None,
    make: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    min_year: int | None = None,
    max_year: int | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    query = select(Vehicle).where(Vehicle.status == VehicleStatus.active)

    if category:
        query = query.where(Vehicle.category == category)
    if city:
        query = query.where(Vehicle.city == city)
    if make:
        query = query.where(Vehicle.make == make)
    if min_price is not None:
        query = query.where(Vehicle.price >= min_price)
    if max_price is not None:
        query = query.where(Vehicle.price <= max_price)
    if min_year is not None:
        query = query.where(Vehicle.year >= min_year)
    if max_year is not None:
        query = query.where(Vehicle.year <= max_year)

    total = session.exec(select(func.count()).select_from(query.subquery())).one()

    query = query.order_by(Vehicle.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    vehicles = session.exec(query).all()

    return VehicleListResponse(total=total, items=to_response_many(vehicles, session))


@router.get("/mine", response_model=VehicleListResponse)
def list_my_vehicles(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    vehicles = session.exec(
        select(Vehicle).where(Vehicle.seller_id == current_user.id).order_by(Vehicle.created_at.desc())
    ).all()
    return VehicleListResponse(total=len(vehicles), items=to_response_many(vehicles, session))


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, session: Session = Depends(get_session)):
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return to_response(vehicle, session)


@router.get("/{vehicle_id}/similar", response_model=VehicleListResponse)
def similar_vehicles(vehicle_id: int, limit: int = Query(default=4, ge=1, le=12), session: Session = Depends(get_session)):
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    own_embedding = session.exec(
        select(VehicleEmbedding).where(VehicleEmbedding.vehicle_id == vehicle_id)
    ).first()
    if not own_embedding:
        return VehicleListResponse(total=0, items=[])

    stmt = (
        select(Vehicle)
        .join(VehicleEmbedding, VehicleEmbedding.vehicle_id == Vehicle.id)
        .where(Vehicle.status == VehicleStatus.active)
        .where(Vehicle.category == vehicle.category)
        .where(Vehicle.id != vehicle_id)
        .order_by(VehicleEmbedding.embedding.cosine_distance(own_embedding.embedding))
        .limit(limit)
    )
    vehicles = session.exec(stmt).all()
    return VehicleListResponse(total=len(vehicles), items=to_response_many(vehicles, session))


def _get_owned_vehicle(vehicle_id: int, current_user: User, session: Session) -> Vehicle:
    vehicle = session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    vehicle = _get_owned_vehicle(vehicle_id, current_user, session)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(vehicle, field, value)
    session.add(vehicle)
    session.commit()
    session.refresh(vehicle)
    if updates.keys() & {"title", "description"}:
        upsert_embedding(vehicle, session)
    return to_response(vehicle, session)


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    vehicle = _get_owned_vehicle(vehicle_id, current_user, session)
    session.delete(vehicle)
    session.commit()


@router.post("/{vehicle_id}/images", response_model=VehicleResponse)
def add_vehicle_image(
    vehicle_id: int,
    image_url: str,
    is_primary: bool = False,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    vehicle = _get_owned_vehicle(vehicle_id, current_user, session)
    existing_count = len(
        session.exec(select(VehicleImage).where(VehicleImage.vehicle_id == vehicle_id)).all()
    )
    image = VehicleImage(
        vehicle_id=vehicle_id,
        image_url=image_url,
        is_primary=is_primary,
        sort_order=existing_count,
    )
    session.add(image)
    session.commit()
    return to_response(vehicle, session)
