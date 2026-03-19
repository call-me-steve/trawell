"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";

export default function CreatorGeofencePage() {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radiusM, setRadiusM] = useState("120");
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
      (p) => {
        setLat(String(p.coords.latitude));
        setLng(String(p.coords.longitude));
      },
      (e) => setError(e.message),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  async function create() {
    setError(null);
    setBusy(true);
    try {
      const data = (await apiFetch("/creator/geofences", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          name: name || undefined,
          center: { lat: Number(lat), lng: Number(lng) },
          radiusM: Number(radiusM),
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
    <main className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Create geofence</h1>
        <a className="text-sm text-zinc-200 underline" href="/creator">
          Back
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Name (optional)</div>
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block space-y-1">
            <div className="text-sm text-zinc-300">Latitude</div>
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 48.85837"
            />
          </label>
          <label className="block space-y-1">
            <div className="text-sm text-zinc-300">Longitude</div>
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 2.29448"
            />
          </label>
        </div>
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Radius (meters)</div>
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={radiusM}
            onChange={(e) => setRadiusM(e.target.value)}
          />
        </label>

        <div className="flex gap-2">
          <button
            onClick={useCurrentLocation}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
          >
            Use my current location
          </button>
          <button
            onClick={create}
            disabled={busy}
            className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
          >
            {busy ? "Creating…" : "Create geofence"}
          </button>
        </div>

        {geofenceId ? (
          <div className="text-sm text-zinc-200">
            Created. Geofence id: <span className="font-mono">{geofenceId}</span>
          </div>
        ) : null}
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
      </div>
    </main>
  );
}

