"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";
import { Nav } from "../../../components/Nav";
import { MapPicker } from "../../../components/MapPicker";

export default function CreatorGeofencePage() {
  const [name, setName] = useState("");
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusM, setRadiusM] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geofenceId, setGeofenceId] = useState<string | null>(null);

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function useCurrentLocation() {
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (p) => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  async function create() {
    setError(null);
    if (!center) {
      setError("Pick a spot on the map (or use current location)");
      return;
    }
    setBusy(true);
    try {
      const data = (await apiFetch("/creator/geofences", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          name: name || undefined,
          center,
          radiusM,
        }),
      })) as any;
      setGeofenceId(String(data.geofence.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-8">
      <Nav />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-semibold">📍 Create geofence</h1>
          <a className="text-sm text-zinc-400 underline" href="/creator">
            ← Back
          </a>
        </div>

        <p className="text-sm text-zinc-400">
          Click the map to pick a spot. Default radius 10m — listeners can play only when inside.
        </p>

        <MapPicker center={center} radiusM={radiusM} onPlace={(lat, lng) => setCenter({ lat, lng })} className="h-[280px]" />

        <div className="space-y-3 rounded border border-zinc-700 bg-black/40 p-4">
          <label className="block">
            <span className="text-sm text-zinc-400">Name (optional)</span>
            <input
              className="mt-1 w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-400">Radius (m)</span>
            <input
              type="number"
              min={1}
              max={500}
              className="mt-1 w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white"
              value={radiusM}
              onChange={(e) => setRadiusM(Number(e.target.value) || 10)}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={useCurrentLocation} className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Use my location
            </button>
            <button
              onClick={create}
              disabled={busy || !center}
              className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
            >
              {busy ? "…" : "Create"}
            </button>
          </div>
          {geofenceId && (
            <div className="text-sm text-zinc-400">
              ✓ Created: <code className="text-zinc-300">{geofenceId}</code>
            </div>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </main>
  );
}
