from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.models.vehicle import Vehicle

MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> list[float]:
    return get_model().encode(text, convert_to_numpy=True).tolist()


def listing_text(vehicle: Vehicle) -> str:
    return (
        f"{vehicle.title}. {vehicle.make} {vehicle.model} {vehicle.year}, "
        f"{vehicle.transmission}, {vehicle.fuel_type}, {vehicle.condition} condition, "
        f"{vehicle.mileage}km, in {vehicle.city}. {vehicle.description}"
    )


def embed_vehicle(vehicle: Vehicle) -> list[float]:
    return embed_text(listing_text(vehicle))
