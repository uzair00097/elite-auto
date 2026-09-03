"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type Vehicle } from "@/lib/api";
import PageSpinner from "@/components/PageSpinner";

function formatPrice(price: number) {
  return `PKR ${price.toLocaleString()}`;
}

const BOOST_STORAGE_KEY = "elite-auto-boosted-listings";

function loadBoostedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(BOOST_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boostedIds, setBoostedIds] = useState<Set<number>>(new Set());
  const [boostNotice, setBoostNotice] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoostedIds(loadBoostedIds());
  }, []);

  const toggleBoost = (vehicleId: number) => {
    setBoostedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
      } else {
        next.add(vehicleId);
        setBoostNotice(vehicleId);
        setTimeout(() => setBoostNotice((cur) => (cur === vehicleId ? null : cur)), 3000);
      }
      localStorage.setItem(BOOST_STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const load = async () => {
    setListLoading(true);
    try {
      const res = await api.myVehicles();
      setVehicles(res.items);
    } catch {
      setError("Couldn't load your listings.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) load();
  }, [user]);

  const toggleSold = async (v: Vehicle) => {
    const updated = await api.updateVehicle(v.id, {
      status: v.status === "active" ? "sold" : "active",
    });
    setVehicles((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
  };

  const remove = async (v: Vehicle) => {
    if (!confirm(`Delete "${v.title}"? This can't be undone.`)) return;
    await api.deleteVehicle(v.id);
    setVehicles((prev) => prev.filter((x) => x.id !== v.id));
  };

  if (loading || !user) return <PageSpinner />;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Listings</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {listLoading ? "Loading…" : `${vehicles.length} listing${vehicles.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link
            href="/sell"
            className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            + New listing
          </Link>
        </div>

        {listLoading && (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}
        {error && <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {!listLoading && !error && vehicles.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-sm font-medium text-slate-600">You haven&apos;t listed anything yet.</p>
            <Link href="/sell" className="mt-2 inline-block text-sm font-medium text-blue-700 hover:text-blue-800">
              Create your first listing →
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {vehicles.map((v) => {
            const primaryImage = v.images.find((i) => i.is_primary) ?? v.images[0];
            return (
              <div
                key={v.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={primaryImage.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/vehicles/${v.id}`} className="truncate font-medium text-slate-900 hover:text-blue-700">
                      {v.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{formatPrice(v.price)}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          v.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {v.status}
                      </span>
                      {boostedIds.has(v.id) && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          🚀 Boosted
                        </span>
                      )}
                    </div>
                    {boostNotice === v.id && (
                      <p className="mt-1 text-xs text-amber-600">
                        Boosted! (Demo only — no real payment was processed.)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                  <button
                    onClick={() => toggleBoost(v.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                      boostedIds.has(v.id)
                        ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {boostedIds.has(v.id) ? "Un-boost" : "🚀 Boost"}
                  </button>
                  <button
                    onClick={() => toggleSold(v)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Mark {v.status === "active" ? "sold" : "active"}
                  </button>
                  <button
                    onClick={() => remove(v)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
