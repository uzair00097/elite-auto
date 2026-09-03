"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api, type Vehicle } from "@/lib/api";
import VehicleCard from "@/components/VehicleCard";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"];

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [make, setMake] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        category: category || undefined,
        city: city || undefined,
        make: make || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
      };
      const res = activeQuery ? await api.semanticSearch(activeQuery, filters) : await api.listVehicles(filters);
      setVehicles(res.items);
      setTotal(res.total);
    } catch {
      setError(
        activeQuery ? "Search failed. Is the backend running?" : "Couldn't load listings. Is the backend running?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery, category, city, make, minPrice, maxPrice]);

  const hasFilters = activeQuery || category || city || make || minPrice || maxPrice;
  const clearFilters = () => {
    setQuery("");
    setActiveQuery("");
    setCategory("");
    setCity("");
    setMake("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950" />
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <Image
            src="/logo-dark.png"
            alt="Elite Auto"
            width={880}
            height={176}
            priority
            className="mx-auto mb-6 h-8 w-auto"
          />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The smartest way to buy and sell used vehicles in Pakistan
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-300">
            Natural language search, verified sellers, and seamless WhatsApp contact.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setActiveQuery(query.trim());
            }}
            className="mx-auto mt-8 flex max-w-xl gap-2"
          >
            <div className="relative flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m1.7-5.3a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Try "automatic family car under 40 lakh in Karachi"'
                className="w-full rounded-full border-0 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex justify-center gap-2">
            {[
              { label: "All", value: "" },
              { label: "Cars", value: "car" },
              { label: "Motorcycles", value: "motorcycle" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === opt.value
                    ? "bg-white text-slate-900"
                    : "bg-white/10 text-slate-200 hover:bg-white/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {activeQuery && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
            <svg className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Semantic results for <span className="font-medium text-slate-900">&ldquo;{activeQuery}&rdquo;</span>
            <button
              onClick={() => {
                setQuery("");
                setActiveQuery("");
              }}
              className="text-blue-700 hover:text-blue-800"
            >
              Clear search
            </button>
          </div>
        )}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Make (e.g. Toyota)"
            className="w-40 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            type="number"
            placeholder="Min price"
            className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            type="number"
            placeholder="Max price"
            className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm font-medium text-blue-700 hover:text-blue-800">
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="aspect-[4/3] w-full bg-slate-100" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-3/4 rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-2/3 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-sm font-medium text-slate-600">No listings match those filters yet.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm font-medium text-blue-700 hover:text-blue-800">
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <>
            <p className="mb-3 text-sm font-medium text-slate-500">{total} listings</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
