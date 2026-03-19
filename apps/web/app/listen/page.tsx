"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/authStore";

type NearbyGeoAudio = {
  geo_audio_id: string;
  title: string;
  description: string | null;
  distance_m: number;
  radius_m: number;
};

export default function ListenPage() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<NearbyGeoAudio[]>([]);
  const [busy, setBusy] = useState(false);
  const [overrideLat, setOverrideLat] = useState("");
  const [overrideLng, setOverrideLng] = useState("");

  const canUseGeo = typeof navigator !== "undefined" && "geolocation" in navigator;
  const isDev = process.env.NODE_ENV !== "production";

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function requestLocation() {
    setError(null);
    if (!canUseGeo) {
      setError("Geolocation is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  function applyOverride() {
    setError(null);
    const lat = Number(overrideLat);
    const lng = Number(overrideLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Invalid override lat/lng");
      return;
    }
    setPos({ lat, lng });
  }

  useEffect(() => {
    if (!pos) return;
    (async () => {
      setBusy(true);
      try {
        const data = (await apiFetch(`/nearby?lat=${pos.lat}&lng=${pos.lng}&radius=3000`, {
          headers: authHeader,
        })) as any;
        setNearby((data.geoAudio ?? []) as NearbyGeoAudio[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load nearby");
      } finally {
        setBusy(false);
      }
    })();
  }, [pos, authHeader]);

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Listener</h1>
          <p className="text-zinc-300">Share GPS, discover nearby audio, and listen only when you’re there.</p>
        </div>
        <a className="text-sm text-zinc-200 underline" href="/">
          Back
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="text-sm text-zinc-300">
          Location:{" "}
          {pos ? (
            <span className="text-zinc-100">
              {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
            </span>
          ) : (
            <span className="text-zinc-500">not shared</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={requestLocation}
            className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950"
          >
            Share GPS location
          </button>
          <a
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
            href="/login"
          >
            Log in
          </a>
        </div>
        {isDev ? (
          <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
            <div className="text-xs font-medium text-zinc-300">Dev: location override</div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600 text-sm"
                value={overrideLat}
                onChange={(e) => setOverrideLat(e.target.value)}
                placeholder="lat"
              />
              <input
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600 text-sm"
                value={overrideLng}
                onChange={(e) => setOverrideLng(e.target.value)}
                placeholder="lng"
              />
              <button
                onClick={applyOverride}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
              >
                Set location
              </button>
            </div>
          </div>
        ) : null}
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Nearby audio</h2>
        {busy ? <div className="text-sm text-zinc-400">Loading…</div> : null}
        <div className="grid gap-3">
          {nearby.map((x) => (
            <a
              key={x.geo_audio_id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 hover:bg-zinc-900/70"
              href={`/listen/${x.geo_audio_id}${pos ? `?lat=${pos.lat}&lng=${pos.lng}` : ""}`}
            >
              <div className="font-medium">{x.title}</div>
              <div className="mt-1 text-sm text-zinc-300 line-clamp-2">{x.description ?? "—"}</div>
              <div className="mt-2 text-xs text-zinc-400">
                {Math.round(x.distance_m)}m away · geofence radius {x.radius_m}m
              </div>
            </a>
          ))}
          {!busy && nearby.length === 0 ? <div className="text-sm text-zinc-400">No public audio nearby.</div> : null}
        </div>
      </section>
    </main>
  );
}

