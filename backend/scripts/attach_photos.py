"""Attaches a representative photo (from Unsplash) to every seed vehicle that has none yet.

Stock photos won't match the exact make/model/year — this is representative imagery
for demo purposes, not literal photos of each listed vehicle.

Requires UNSPLASH_ACCESS_KEY in backend/.env.
Run from backend/: ./.venv/Scripts/python scripts/attach_photos.py
"""

import sys
import time
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

import cloudinary
import cloudinary.uploader
import httpx
from sqlmodel import Session, select

from app.core.config import settings
from app.db.session import engine
from app.models.vehicle import Vehicle, VehicleImage

UNSPLASH_ACCESS_KEY = settings.unsplash_access_key

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)

# Well-known international brands search well on stock photography.
# Local Pakistani motorcycle brands (United, Road Prince) fall back to a generic query.
QUERY_OVERRIDES = {
    "United": "commuter motorcycle",
    "Road Prince": "commuter motorcycle",
}


def query_for(vehicle: Vehicle) -> str:
    override = QUERY_OVERRIDES.get(vehicle.make)
    if override:
        return override
    if vehicle.category == "motorcycle":
        return f"{vehicle.make} motorcycle"
    return f"{vehicle.make} car"


def search_unsplash(client: httpx.Client, query: str, count: int = 10) -> list[dict]:
    resp = client.get(
        "https://api.unsplash.com/search/photos",
        params={"query": query, "per_page": count, "orientation": "landscape"},
        headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
    )
    resp.raise_for_status()
    return resp.json().get("results", [])


def main():
    if not UNSPLASH_ACCESS_KEY:
        print("UNSPLASH_ACCESS_KEY not set in backend/.env")
        return

    with Session(engine) as session:
        vehicles = session.exec(select(Vehicle)).all()
        existing_image_vehicle_ids = {
            img.vehicle_id for img in session.exec(select(VehicleImage)).all()
        }
        vehicles_needing_photos = [v for v in vehicles if v.id not in existing_image_vehicle_ids]

    print(f"{len(vehicles_needing_photos)} vehicles need photos.")

    photo_cache: dict[str, list[dict]] = {}
    query_cursor: dict[str, int] = {}

    with httpx.Client(timeout=30) as client, Session(engine) as session:
        for vehicle in vehicles_needing_photos:
            query = query_for(vehicle)

            if query not in photo_cache:
                try:
                    photo_cache[query] = search_unsplash(client, query)
                except httpx.HTTPStatusError as e:
                    print(f"  search failed for '{query}': {e}")
                    photo_cache[query] = []
                query_cursor[query] = 0
                time.sleep(0.3)

            results = photo_cache[query]
            if not results:
                print(f"  no results for '{query}', skipping vehicle {vehicle.id}")
                continue

            idx = query_cursor[query] % len(results)
            query_cursor[query] += 1
            photo = results[idx]
            image_url = photo["urls"]["regular"]

            try:
                # Cloudinary can fetch-and-upload directly from a remote URL.
                upload_result = cloudinary.uploader.upload(image_url, folder="elite-auto")
            except Exception as e:
                print(f"  upload failed for vehicle {vehicle.id}: {e}")
                continue

            # Comply with Unsplash API guidelines: ping download_location when a photo is used.
            try:
                client.get(
                    photo["links"]["download_location"],
                    headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
                )
            except httpx.HTTPError:
                pass

            image = VehicleImage(
                vehicle_id=vehicle.id,
                image_url=upload_result["secure_url"],
                is_primary=True,
                sort_order=0,
            )
            session.add(image)
            session.commit()
            print(f"  vehicle {vehicle.id} ({vehicle.title}) <- '{query}' photo by {photo['user']['name']}")

    print("Done.")


if __name__ == "__main__":
    main()
