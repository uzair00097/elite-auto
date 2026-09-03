"""Backfills embeddings for any vehicle that doesn't have one yet.

Run from backend/: ./.venv/Scripts/python scripts/embed_listings.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlmodel import Session, select

from app.core.embeddings import embed_vehicle
from app.db.session import engine
from app.models.vehicle import Vehicle, VehicleEmbedding


def main():
    with Session(engine) as session:
        vehicles = session.exec(select(Vehicle)).all()
        already_embedded = {e.vehicle_id for e in session.exec(select(VehicleEmbedding)).all()}
        pending = [v for v in vehicles if v.id not in already_embedded]

        print(f"{len(pending)} vehicles need embeddings.")
        for vehicle in pending:
            vector = embed_vehicle(vehicle)
            session.add(VehicleEmbedding(vehicle_id=vehicle.id, embedding=vector))
            session.commit()
            print(f"  embedded vehicle {vehicle.id}: {vehicle.title}")

        print("Done.")


if __name__ == "__main__":
    main()
