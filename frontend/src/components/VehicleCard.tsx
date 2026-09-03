import Link from "next/link";
import type { Vehicle } from "@/lib/api";
import NoPhotoPlaceholder from "@/components/NoPhotoPlaceholder";

function formatPrice(price: number) {
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} lakh`;
  return `PKR ${price.toLocaleString()}`;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const primaryImage = vehicle.images.find((i) => i.is_primary) ?? vehicle.images[0];

  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.image_url}
            alt={vehicle.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <NoPhotoPlaceholder category={vehicle.category} />
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-700 shadow-sm backdrop-blur">
          {vehicle.category}
        </span>
        {vehicle.status === "sold" && (
          <span className="absolute right-2 top-2 rounded-full bg-slate-900/90 px-2 py-0.5 text-[11px] font-medium text-white">
            Sold
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-slate-900">{vehicle.title}</p>
        <p className="mt-1 text-base font-bold text-blue-700">{formatPrice(vehicle.price)}</p>
        <p className="mt-1 text-xs text-slate-500">
          {vehicle.year} · {vehicle.mileage.toLocaleString()} km · {vehicle.city}
        </p>
      </div>
    </Link>
  );
}
