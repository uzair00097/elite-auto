"""Seeds the database with realistic sellers and vehicle listings for demo/dev purposes.

Run from backend/: ./.venv/Scripts/python scripts/seed.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlmodel import Session, select

from app.core.security import hash_password
from app.db.session import engine
from app.models.user import User
from app.models.vehicle import Vehicle

SELLERS = [
    {"name": "Bilal Ahmed", "email": "bilal.ahmed@seed.eliteauto.pk", "city": "Lahore"},
    {"name": "Sana Malik", "email": "sana.malik@seed.eliteauto.pk", "city": "Karachi"},
    {"name": "Usman Tariq", "email": "usman.tariq@seed.eliteauto.pk", "city": "Islamabad"},
    {"name": "Ayesha Raza", "email": "ayesha.raza@seed.eliteauto.pk", "city": "Rawalpindi"},
    {"name": "Hamza Sheikh", "email": "hamza.sheikh@seed.eliteauto.pk", "city": "Faisalabad"},
    {"name": "Fatima Noor", "email": "fatima.noor@seed.eliteauto.pk", "city": "Peshawar"},
    {"name": "Kashif Iqbal", "email": "kashif.iqbal@seed.eliteauto.pk", "city": "Lahore"},
    {"name": "Zainab Hussain", "email": "zainab.hussain@seed.eliteauto.pk", "city": "Karachi"},
]

SEED_PASSWORD = "SeedSeller123"

VEHICLES = [
    dict(category="car", title="2019 Toyota Corolla Altis 1.6 Automatic", make="Toyota", model="Corolla Altis",
         year=2019, price=3900000, mileage=48000, transmission="automatic", fuel_type="petrol", city="Lahore",
         condition="excellent",
         description="Single owner, showroom maintained, all original genuine parts, non-accidental, ready to drive."),
    dict(category="car", title="2020 Honda City Aspire Manual", make="Honda", model="City Aspire",
         year=2020, price=4200000, mileage=30000, transmission="manual", fuel_type="petrol", city="Karachi",
         condition="excellent",
         description="Company maintained, done only 30,000 km, brand new tyres, cold AC, sunroof variant."),
    dict(category="car", title="2021 Suzuki Alto VXL Automatic", make="Suzuki", model="Alto VXL",
         year=2021, price=2650000, mileage=22000, transmission="automatic", fuel_type="petrol", city="Islamabad",
         condition="excellent",
         description="Bought brand new, first owner, still under warranty, ideal city car with great fuel average."),
    dict(category="car", title="2021 Toyota Yaris ATIV X Automatic", make="Toyota", model="Yaris ATIV X",
         year=2021, price=4650000, mileage=35000, transmission="automatic", fuel_type="petrol", city="Rawalpindi",
         condition="good",
         description="Fully loaded with cruise control, push start, DVD player. Bank leased, easy transfer available."),
    dict(category="car", title="2018 Honda Civic Oriel Turbo Automatic", make="Honda", model="Civic Oriel",
         year=2018, price=5800000, mileage=62000, transmission="automatic", fuel_type="petrol", city="Lahore",
         condition="good",
         description="Turbo variant, sunroof, paddle shifters. Minor touch up on bumper, otherwise excellent condition."),
    dict(category="car", title="2020 Suzuki Cultus VXL Manual", make="Suzuki", model="Cultus VXL",
         year=2020, price=2950000, mileage=40000, transmission="manual", fuel_type="petrol", city="Faisalabad",
         condition="good",
         description="Family used car, always garage parked, recent service done, genuine 40,000 km."),
    dict(category="car", title="2022 KIA Sportage AWD Automatic", make="KIA", model="Sportage",
         year=2022, price=8900000, mileage=18000, transmission="automatic", fuel_type="petrol", city="Islamabad",
         condition="excellent",
         description="Like new SUV, panoramic sunroof, 4WD, ventilated seats. Urgent sale due to relocation abroad."),
    dict(category="car", title="2021 Hyundai Elantra GLS Automatic", make="Hyundai", model="Elantra GLS",
         year=2021, price=5400000, mileage=27000, transmission="automatic", fuel_type="petrol", city="Karachi",
         condition="excellent",
         description="Fully loaded sedan, leather seats, spacious trunk, perfect for highway trips."),
    dict(category="car", title="2016 Toyota Prius Hybrid Automatic", make="Toyota", model="Prius",
         year=2016, price=3450000, mileage=85000, transmission="automatic", fuel_type="hybrid", city="Karachi",
         condition="good",
         description="Excellent fuel average, hybrid battery in great health, well maintained by first owner."),
    dict(category="car", title="2019 Daihatsu Mira X Automatic", make="Daihatsu", model="Mira X",
         year=2019, price=1950000, mileage=45000, transmission="automatic", fuel_type="petrol", city="Peshawar",
         condition="good",
         description="Small economical car, great for daily commute, AC chilled, negotiable price."),
    dict(category="car", title="2019 Honda BR-V S Manual", make="Honda", model="BR-V S",
         year=2019, price=4100000, mileage=52000, transmission="manual", fuel_type="petrol", city="Lahore",
         condition="good",
         description="7 seater family car, spacious interior, recently serviced, tyres 80% left."),
    dict(category="car", title="2022 Suzuki Wagon R VXL Automatic", make="Suzuki", model="Wagon R VXL",
         year=2022, price=3150000, mileage=15000, transmission="automatic", fuel_type="petrol", city="Rawalpindi",
         condition="excellent",
         description="Almost new condition, single owner, all documents complete, exchange possible with bike."),
    dict(category="car", title="2017 Toyota Fortuner Sigma4 Automatic", make="Toyota", model="Fortuner Sigma4",
         year=2017, price=11500000, mileage=90000, transmission="automatic", fuel_type="diesel", city="Islamabad",
         condition="good",
         description="Powerful 4x4 SUV, well maintained, recently new tyres and battery installed."),
    dict(category="car", title="2023 Honda Civic VTi Oriel Automatic", make="Honda", model="Civic VTi Oriel",
         year=2023, price=8200000, mileage=5000, transmission="automatic", fuel_type="petrol", city="Karachi",
         condition="excellent",
         description="Brand new condition, under manufacturer warranty, only 5000 km driven."),
    dict(category="car", title="2020 Suzuki Swift DLX Manual", make="Suzuki", model="Swift DLX",
         year=2020, price=2850000, mileage=38000, transmission="manual", fuel_type="petrol", city="Faisalabad",
         condition="good",
         description="Sporty hatchback, fuel efficient, good for young drivers, minor scratches on rear bumper."),
    dict(category="car", title="2015 Toyota Corolla GLi Manual", make="Toyota", model="Corolla GLi",
         year=2015, price=2650000, mileage=110000, transmission="manual", fuel_type="petrol", city="Peshawar",
         condition="fair",
         description="Reliable daily driver, engine in good condition, needs minor paint touch up."),
    dict(category="car", title="2020 Kia Picanto Automatic", make="Kia", model="Picanto",
         year=2020, price=2450000, mileage=33000, transmission="automatic", fuel_type="petrol", city="Lahore",
         condition="good",
         description="Compact city car, easy to park, low fuel consumption, AC works perfectly."),
    dict(category="car", title="2022 Hyundai Tucson Automatic", make="Hyundai", model="Tucson",
         year=2022, price=7650000, mileage=20000, transmission="automatic", fuel_type="petrol", city="Islamabad",
         condition="excellent",
         description="Almost new SUV, all advance safety features, panoramic sunroof, leather interior."),
    dict(category="motorcycle", title="2022 Honda CD 70", make="Honda", model="CD 70",
         year=2022, price=145000, mileage=8000, transmission="manual", fuel_type="petrol", city="Lahore",
         condition="good",
         description="Fuel efficient commuter bike, first owner, all papers clear, minor scratches."),
    dict(category="motorcycle", title="2021 Yamaha YBR 125", make="Yamaha", model="YBR 125",
         year=2021, price=285000, mileage=15000, transmission="manual", fuel_type="petrol", city="Karachi",
         condition="good",
         description="Smooth ride, recently serviced, new chain sprocket kit installed."),
    dict(category="motorcycle", title="2020 Suzuki GS 150", make="Suzuki", model="GS 150",
         year=2020, price=245000, mileage=22000, transmission="manual", fuel_type="petrol", city="Islamabad",
         condition="good",
         description="Strong engine, good for daily commute, tank and body in great condition."),
    dict(category="motorcycle", title="2019 Honda CG 125", make="Honda", model="CG 125",
         year=2019, price=195000, mileage=30000, transmission="manual", fuel_type="petrol", city="Rawalpindi",
         condition="fair",
         description="Used but well maintained, engine recently overhauled, reliable bike."),
    dict(category="motorcycle", title="2023 United US 70", make="United", model="US 70",
         year=2023, price=125000, mileage=3000, transmission="manual", fuel_type="petrol", city="Faisalabad",
         condition="excellent",
         description="Almost brand new, bought this year, single owner, urgent sale."),
    dict(category="motorcycle", title="2021 Road Prince RP 70", make="Road Prince", model="RP 70",
         year=2021, price=110000, mileage=18000, transmission="manual", fuel_type="petrol", city="Peshawar",
         condition="good",
         description="Economical bike, good mileage, minor wear and tear, price negotiable."),
    dict(category="motorcycle", title="2022 Yamaha YBR 125G Graphic Edition", make="Yamaha", model="YBR 125G",
         year=2022, price=310000, mileage=9000, transmission="manual", fuel_type="petrol", city="Lahore",
         condition="excellent",
         description="Graphic edition, like new condition, all original parts, single owner."),
]


def slugify(title: str, suffix: str) -> str:
    import re

    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{base}-{suffix}"


def main():
    with Session(engine) as session:
        seller_ids = []
        for seller in SELLERS:
            existing = session.exec(select(User).where(User.email == seller["email"])).first()
            if existing:
                seller_ids.append(existing.id)
                continue
            user = User(
                name=seller["name"],
                email=seller["email"],
                password_hash=hash_password(SEED_PASSWORD),
                city=seller["city"],
                is_seller=True,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            seller_ids.append(user.id)

        created = 0
        for i, v in enumerate(VEHICLES):
            slug = slugify(v["title"], f"seed{i:03d}")
            existing = session.exec(select(Vehicle).where(Vehicle.slug == slug)).first()
            if existing:
                continue
            vehicle = Vehicle(seller_id=seller_ids[i % len(seller_ids)], slug=slug, **v)
            session.add(vehicle)
            created += 1

        session.commit()
        print(f"Seeded {len(seller_ids)} sellers, {created} new vehicles ({len(VEHICLES)} total in seed data).")


if __name__ == "__main__":
    main()
