import re

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, func, select

from app.api.routes.vehicles import to_response_many
from app.core.embeddings import embed_text
from app.db.session import get_session
from app.models.vehicle import Vehicle, VehicleCategory, VehicleEmbedding, VehicleStatus
from app.schemas.vehicle import VehicleListResponse

router = APIRouter(prefix="/search", tags=["search"])

CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"]

CAR_HINTS = ["car", "sedan", "suv", "hatchback"]
MOTORCYCLE_HINTS = ["bike", "motorcycle", "motorbike"]


def extract_filters(query: str) -> dict:
    filters: dict = {}
    lowered = query.lower()

    for city in CITIES:
        if city.lower() in lowered:
            filters["city"] = city
            break

    price_match = re.search(r"(?:under|below|less than|up to)\s+(\d+(?:\.\d+)?)\s*lakh", lowered)
    if price_match:
        filters["max_price"] = int(float(price_match.group(1)) * 100_000)

    if any(word in lowered for word in MOTORCYCLE_HINTS):
        filters["category"] = VehicleCategory.motorcycle
    elif any(word in lowered for word in CAR_HINTS):
        filters["category"] = VehicleCategory.car

    return filters


@router.get("/semantic", response_model=VehicleListResponse)
def semantic_search(
    q: str,
    session: Session = Depends(get_session),
    category: VehicleCategory | None = None,
    city: str | None = None,
    make: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    extracted = extract_filters(q)
    category = category or extracted.get("category")
    city = city or extracted.get("city")
    max_price = max_price if max_price is not None else extracted.get("max_price")

    query_embedding = embed_text(q)

    stmt = (
        select(Vehicle)
        .join(VehicleEmbedding, VehicleEmbedding.vehicle_id == Vehicle.id)
        .where(Vehicle.status == VehicleStatus.active)
    )
    if category:
        stmt = stmt.where(Vehicle.category == category)
    if city:
        stmt = stmt.where(Vehicle.city == city)
    if make:
        stmt = stmt.where(Vehicle.make == make)
    if min_price is not None:
        stmt = stmt.where(Vehicle.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Vehicle.price <= max_price)

    # Count against the filtered-but-unordered query so we don't pay for cosine-distance
    # computation just to get a row count.
    total = session.exec(select(func.count()).select_from(stmt.subquery())).one()

    page_stmt = (
        stmt.order_by(VehicleEmbedding.embedding.cosine_distance(query_embedding))
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    vehicles = session.exec(page_stmt).all()

    return VehicleListResponse(total=total, items=to_response_many(vehicles, session))
