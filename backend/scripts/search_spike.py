"""De-risking spike for Week 2 hybrid semantic search (see project plan Week 1 task).

Goal: before building the real /search/semantic endpoint, sanity-check whether
embedding similarity + SQL-style filters produce sensible rankings on our sparse
(~25 listing) seed dataset. Uses a local sentence-transformers model so it runs
with no API key; swap in OpenAI embeddings later, the ranking logic transfers
directly (cosine similarity over embedding vectors either way).

Run from backend/: ./.venv/Scripts/python scripts/search_spike.py
"""

import re
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sentence_transformers import SentenceTransformer, util
from sqlmodel import Session, select

from app.db.session import engine
from app.models.vehicle import Vehicle

TEST_QUERIES = [
    "automatic family car under 40 lakh in Karachi",
    "cheap fuel efficient bike for daily commute",
    "reliable SUV for long trips with good safety features",
    "first owner low mileage sedan",
    "economical small car for a student",
]

CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"]


def extract_filters(query: str):
    """Very rough keyword-based filter extraction — good enough for the spike."""
    filters = {}
    for city in CITIES:
        if city.lower() in query.lower():
            filters["city"] = city
            break

    lakh_match = re.search(r"under\s+(\d+)\s*lakh", query, re.IGNORECASE)
    if lakh_match:
        filters["max_price"] = int(lakh_match.group(1)) * 100_000

    if "bike" in query.lower() or "motorcycle" in query.lower():
        filters["category"] = "motorcycle"
    elif "car" in query.lower() or "sedan" in query.lower() or "suv" in query.lower():
        filters["category"] = "car"

    return filters


def listing_text(v: Vehicle) -> str:
    return f"{v.title}. {v.make} {v.model} {v.year}, {v.transmission}, {v.fuel_type}, {v.condition} condition, {v.mileage}km, in {v.city}. {v.description}"


def main():
    print("Loading local embedding model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    with Session(engine) as session:
        vehicles = session.exec(select(Vehicle).where(Vehicle.status == "active")).all()

    print(f"Embedding {len(vehicles)} listings...\n")
    texts = [listing_text(v) for v in vehicles]
    listing_embeddings = model.encode(texts, convert_to_tensor=True)

    for query in TEST_QUERIES:
        filters = extract_filters(query)
        query_embedding = model.encode(query, convert_to_tensor=True)
        scores = util.cos_sim(query_embedding, listing_embeddings)[0]

        # Apply extracted SQL-style filters, then rank the remainder by similarity.
        candidates = []
        for v, score in zip(vehicles, scores):
            if filters.get("city") and v.city != filters["city"]:
                continue
            if filters.get("max_price") and v.price > filters["max_price"]:
                continue
            if filters.get("category") and v.category != filters["category"]:
                continue
            candidates.append((float(score), v))

        candidates.sort(key=lambda x: x[0], reverse=True)

        print(f'Query: "{query}"')
        print(f"  Extracted filters: {filters or 'none'}")
        if not candidates:
            print("  No results after filtering.")
        for score, v in candidates[:5]:
            print(f"  [{score:.3f}] {v.title} — PKR {v.price:,} — {v.city}")
        print()


if __name__ == "__main__":
    main()
