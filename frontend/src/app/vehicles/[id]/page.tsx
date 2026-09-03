"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, type Vehicle } from "@/lib/api";
import NoPhotoPlaceholder from "@/components/NoPhotoPlaceholder";
import VehicleCard from "@/components/VehicleCard";

function formatPrice(price: number) {
  return `PKR ${price.toLocaleString()}`;
}

const SPECS: { label: string; value: (v: Vehicle) => string }[] = [
  { label: "Make / Model", value: (v) => `${v.make} ${v.model}` },
  { label: "Year", value: (v) => `${v.year}` },
  { label: "Mileage", value: (v) => `${v.mileage.toLocaleString()} km` },
  { label: "Transmission", value: (v) => v.transmission },
  { label: "Fuel type", value: (v) => v.fuel_type },
  { label: "Condition", value: (v) => v.condition },
];

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [similar, setSimilar] = useState<Vehicle[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveImage(0);
    api
      .getVehicle(Number(id))
      .then(setVehicle)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load listing"))
      .finally(() => setLoading(false));
    api
      .similarVehicles(Number(id))
      .then((res) => setSimilar(res.items))
      .catch(() => setSimilar([]));
  }, [id]);

  const imageCount = vehicle?.images.length ?? 0;

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      else if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % imageCount);
      else if (e.key === "ArrowLeft") setActiveImage((i) => (i - 1 + imageCount) % imageCount);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, imageCount]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="skeleton aspect-[4/3] rounded-xl md:col-span-3" />
          <div className="space-y-3 md:col-span-2">
            <div className="skeleton h-6 w-2/3 rounded" />
            <div className="skeleton h-8 w-1/3 rounded" />
            <div className="skeleton h-32 rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !vehicle) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-semibold text-slate-900">{error ?? "Listing not found"}</h1>
        <p className="mt-1 text-sm text-slate-500">It may have been sold or removed.</p>
        <Link
          href="/"
          className="mt-5 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
        >
          Back to browse
        </Link>
      </div>
    );
  }

  const images = vehicle.images.length > 0 ? vehicle.images : [];
  const whatsappNumber = vehicle.seller_phone ? vehicle.seller_phone.replace(/^0/, "92") : null;
  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in your ${vehicle.title} listed on Elite Auto for ${formatPrice(vehicle.price)}.`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to browse
      </Link>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3">
          <div
            className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm ${
              images.length > 0 ? "cursor-zoom-in" : ""
            }`}
            onClick={() => images.length > 0 && setLightboxOpen(true)}
          >
            {images.length > 0 ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={images[activeImage].image_url}
                  alt={vehicle.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/0 text-white opacity-0 shadow-sm transition group-hover:bg-white/90 group-hover:text-slate-700 group-hover:opacity-100">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6M8 11h6"
                      />
                    </svg>
                  </span>
                </div>
              </>
            ) : (
              <NoPhotoPlaceholder category={vehicle.category} />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === activeImage ? "border-blue-600" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{vehicle.description}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:sticky md:top-20">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                vehicle.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {vehicle.status}
            </span>
            <h1 className="font-display mt-2 text-xl font-bold leading-tight text-slate-900">{vehicle.title}</h1>
            <p className="font-display mt-1 text-2xl font-bold text-blue-700">{formatPrice(vehicle.price)}</p>

            <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
              {SPECS.map((spec) => (
                <div key={spec.label} className="rounded-lg bg-slate-50 p-2.5">
                  <dt className="text-xs text-slate-500">{spec.label}</dt>
                  <dd className="font-medium capitalize text-slate-900">{spec.value(vehicle)}</dd>
                </div>
              ))}
              <div className="col-span-2 rounded-lg bg-slate-50 p-2.5">
                <dt className="text-xs text-slate-500">City</dt>
                <dd className="font-medium text-slate-900">{vehicle.city}</dd>
              </div>
            </dl>

            <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">Seller:</span>
              <span className="font-medium text-slate-900">{vehicle.seller_name}</span>
              {vehicle.seller_verified && (
                <span
                  title="Phone number verified"
                  className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>

            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 012.41 5.83c0 4.55-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.28z" />
                </svg>
                Contact seller on WhatsApp
              </a>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                Seller hasn&apos;t provided a phone number yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {lightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-[0.95]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((i) => (i - 1 + images.length) % images.length);
                }}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-[0.95] sm:left-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImage((i) => (i + 1) % images.length);
                }}
                aria-label="Next image"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-[0.95] sm:right-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[activeImage].image_url}
            alt={vehicle.title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          />

          {images.length > 1 && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
              {activeImage + 1} / {images.length}
            </span>
          )}
        </div>
      )}

      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-lg font-bold text-slate-900">Similar vehicles</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
