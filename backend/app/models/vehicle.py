from datetime import datetime, timezone
from enum import Enum

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey
from sqlmodel import Column, Field, Integer, SQLModel

EMBEDDING_DIM = 384  # sentence-transformers/all-MiniLM-L6-v2


class VehicleCategory(str, Enum):
    car = "car"
    motorcycle = "motorcycle"


class VehicleStatus(str, Enum):
    active = "active"
    sold = "sold"


class Transmission(str, Enum):
    automatic = "automatic"
    manual = "manual"


class FuelType(str, Enum):
    petrol = "petrol"
    diesel = "diesel"
    hybrid = "hybrid"
    electric = "electric"
    cng = "cng"


class Condition(str, Enum):
    excellent = "excellent"
    good = "good"
    fair = "fair"


class Vehicle(SQLModel, table=True):
    __tablename__ = "vehicles"

    id: int | None = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="users.id", index=True)
    category: VehicleCategory
    title: str
    slug: str = Field(unique=True, index=True)
    make: str = Field(index=True)
    model: str
    year: int
    price: int
    mileage: int
    transmission: Transmission
    fuel_type: FuelType
    city: str = Field(index=True)
    condition: Condition
    description: str
    status: VehicleStatus = Field(default=VehicleStatus.active, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class VehicleImage(SQLModel, table=True):
    __tablename__ = "vehicle_images"

    id: int | None = Field(default=None, primary_key=True)
    vehicle_id: int = Field(
        sa_column=Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), index=True)
    )
    image_url: str
    is_primary: bool = Field(default=False)
    sort_order: int = Field(default=0)


class VehicleEmbedding(SQLModel, table=True):
    __tablename__ = "vehicle_embeddings"

    id: int | None = Field(default=None, primary_key=True)
    vehicle_id: int = Field(
        sa_column=Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), unique=True, index=True)
    )
    embedding: list[float] = Field(sa_column=Column(Vector(EMBEDDING_DIM)))


class Favorite(SQLModel, table=True):
    __tablename__ = "favorites"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    vehicle_id: int = Field(
        sa_column=Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), index=True)
    )
