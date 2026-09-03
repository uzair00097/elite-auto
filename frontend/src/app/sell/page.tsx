"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type Vehicle } from "@/lib/api";
import PageSpinner from "@/components/PageSpinner";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"];

type FormState = {
  category: "car" | "motorcycle";
  title: string;
  make: string;
  model: string;
  year: string;
  price: string;
  mileage: string;
  transmission: "automatic" | "manual";
  fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "cng";
  city: string;
  condition: "excellent" | "good" | "fair";
  description: string;
};

const initialForm: FormState = {
  category: "car",
  title: "",
  make: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  transmission: "automatic",
  fuel_type: "petrol",
  city: "",
  condition: "good",
  description: "",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-slate-700";

function StepIndicator({ step }: { step: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Details" },
    { n: 2, label: "Photos" },
  ];
  return (
    <div className="mb-8 flex items-center">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= s.n ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {s.n}
            </div>
            <span className={`mt-1 text-xs font-medium ${step >= s.n ? "text-slate-900" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-3 h-0.5 w-16 ${step > s.n ? "bg-blue-700" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SellPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createVehicle({
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
      });
      setVehicle(created);
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const onUploadImages = async (files: FileList | null) => {
    if (!files || !vehicle) return;
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const sig = await api.uploadSignature();
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", sig.api_key);
        body.append("timestamp", String(sig.timestamp));
        body.append("signature", sig.signature);
        body.append("folder", sig.folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, {
          method: "POST",
          body,
        });
        if (!res.ok) throw new Error("Image upload to Cloudinary failed");
        const data = await res.json();

        const updated = await api.addVehicleImage(
          vehicle.id,
          data.secure_url,
          vehicle.images.length === 0 && i === 0
        );
        setVehicle(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !user) return <PageSpinner />;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-xl font-bold text-slate-900">List a vehicle</h1>
        <p className="mt-1 text-sm text-slate-500">Reach thousands of buyers across Pakistan.</p>

        <div className="mt-6">
          <StepIndicator step={step} />
        </div>

        {step === 1 && (
          <form onSubmit={onSubmitDetails} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={(e) => update("category", e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>City</label>
                <select required value={form.city} onChange={(e) => update("city", e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="">Select</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Listing title</label>
              <input
                required
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. 2018 Toyota Corolla Altis Automatic"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Make</label>
                <input required value={form.make} onChange={(e) => update("make", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Model</label>
                <input required value={form.model} onChange={(e) => update("model", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Year</label>
                <input required type="number" value={form.year} onChange={(e) => update("year", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Price (PKR)</label>
                <input required type="number" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Mileage (km)</label>
                <input required type="number" value={form.mileage} onChange={(e) => update("mileage", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Transmission</label>
                <select value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="automatic">Automatic</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Fuel type</label>
                <select value={form.fuel_type} onChange={(e) => update("fuel_type", e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="electric">Electric</option>
                  <option value="cng">CNG</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Condition</label>
                <select value={form.condition} onChange={(e) => update("condition", e.target.value)} className={`${inputClass} bg-white`}>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? "Creating…" : "Continue to photos"}
            </button>
          </form>
        )}

        {step === 2 && vehicle && (
          <div className="space-y-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/30">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v13.5" />
              </svg>
              <span className="mt-2 text-sm font-medium text-slate-700">Click to upload photos</span>
              <span className="text-xs text-slate-400">PNG or JPG, multiple files supported</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => onUploadImages(e.target.files)}
                className="hidden"
              />
            </label>
            {uploading && <p className="text-sm text-slate-500">Uploading…</p>}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            {vehicle.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {vehicle.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover shadow-sm"
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => router.push(`/vehicles/${vehicle.id}`)}
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 active:scale-[0.98]"
            >
              Done — view listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
