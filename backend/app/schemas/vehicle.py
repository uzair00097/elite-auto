from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.vehicle import Condition, FuelType, Transmission, VehicleCategory, VehicleStatus


class VehicleCreate(BaseModel):
    category: VehicleCategory
    title: str
    make: str
    model: str
    year: int
    price: int
    mileage: int
    transmission: Transmission
    fuel_type: FuelType
    city: str
    condition: Condition
    description: str


class VehicleUpdate(BaseModel):
    title: str | None = None
    price: int | None = None
    mileage: int | None = None
    city: str | None = None
    condition: Condition | None = None
    description: str | None = None
    status: VehicleStatus | None = None
    boosted: bool | None = None


class VehicleImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    is_primary: bool
    sort_order: int


class VehicleResponse(BaseModel):
    id: int
    seller_id: int
    category: VehicleCategory
    title: str
    slug: str
    make: str
    model: str
    year: int
    price: int
    mileage: int
    transmission: Transmission
    fuel_type: FuelType
    city: str
    condition: Condition
    description: str
    status: VehicleStatus
    boosted: bool
    created_at: datetime
    images: list[VehicleImageResponse] = []
    seller_name: str
    seller_phone: str | None
    seller_verified: bool


class VehicleListResponse(BaseModel):
    total: int
    items: list[VehicleResponse]
