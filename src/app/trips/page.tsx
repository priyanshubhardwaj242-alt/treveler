"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonAttractionGrid } from "@/components/ui/Skeleton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useToast } from "@/components/ui/Toast";
import { fetchJson } from "@/lib/fetchJson";

interface TripSummary {
  id: string;
  destination: string;
  days: number;
  travelers: number;
  budget: number;
  hotelTier: string;
  status: string;
  updatedAt: string;
}

export default function TripsPage() {
  const toast = useToast();
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setError("");
    try {
      const data = await fetchJson<TripSummary[]>("/api/trips");
      setTrips(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your trips.");
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this trip? This can't be undone.")) return;
    setBusyId(id);
    try {
      await fetchJson(`/api/trips/${id}`, { method: "DELETE" });
      setTrips(prev => prev?.filter(t => t.id !== id) ?? null);
      toast.push("Trip deleted");
    } catch (e) {
      toast.push(e instanceof Error ? e.message : "Couldn't delete this trip.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(id: string) {
    setBusyId(id);
    try {
      const full = await fetchJson<Record<string, unknown>>(`/api/trips/${id}`);
      const { id: _id, userId: _u, createdAt: _c, updatedAt: _up, ...rest } = full as Record<string, unknown> & { id: string };
      const created = await fetchJson<TripSummary>("/api/trips", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rest, destination: `${rest.destination} (copy)`, status: "draft" })
      });
      setTrips(prev => (prev ? [created, ...prev] : [created]));
      toast.push("Trip duplicated");
    } catch (e) {
      toast.push(e instanceof Error ? e.message : "Couldn't duplicate this trip.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <Navbar />
      <div className="max-w-5xl mx-auto px-7 pt-10 pb-16">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-coral mb-3">● Your trips</div>
            <h1 className="font-display text-4xl font-semibold">My trips</h1>
          </div>
          <Link href="/dashboard" className="btn-primary">Plan a new trip</Link>
        </div>

        {error && <ErrorBanner message={error} onRetry={load} />}

        {trips === null && !error && <SkeletonAttractionGrid count={3} />}

        {trips && trips.length === 0 && (
          <EmptyState
            title="No saved trips yet"
            body="Once you build and save an itinerary, it'll show up here."
            actionLabel="Plan your first trip"
            onAction={() => (window.location.href = "/dashboard")}
          />
        )}

        {trips && trips.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {trips.map(trip => (
              <div key={trip.id} className="card card-interactive p-5 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold truncate">{trip.destination}</h3>
                    <span className="text-[11px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full bg-moss/15 text-moss flex-shrink-0">
                      {trip.status}
                    </span>
                  </div>
                  <p className="text-xs text-harbor/60 dark:text-[#A9BBB5]">
                    {trip.days} days · {trip.travelers} traveler{trip.travelers !== 1 ? "s" : ""} · {trip.hotelTier} · ₹{trip.budget.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-2 mt-auto pt-2">
                  <Link href={`/trip/${trip.id}`} className="btn-outline flex-1 text-center">View</Link>
                  <button
                    onClick={() => handleDuplicate(trip.id)}
                    disabled={busyId === trip.id}
                    className="btn-outline px-3"
                    aria-label={`Duplicate ${trip.destination} trip`}
                    title="Duplicate"
                  >
                    ⧉
                  </button>
                  <button
                    onClick={() => handleDelete(trip.id)}
                    disabled={busyId === trip.id}
                    className="btn-outline px-3 hover:border-coral hover:text-coral-dark"
                    aria-label={`Delete ${trip.destination} trip`}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
