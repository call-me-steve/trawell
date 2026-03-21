"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/authStore";
import { Nav } from "../components/Nav";

export default function CreatorPage() {
  const [error, setError] = useState<string | null>(null);
  const [seedInfo, setSeedInfo] = useState<any>(null);

  const token = typeof window !== "undefined" ? getAccessToken() : null;
  const authHeader = useMemo(() => (token ? { authorization: `Bearer ${token}` } : {}), [token]);

  async function becomeCreator() {
    setError(null);
    try {
      await apiFetch("/creator/profile/become", { method: "POST", headers: authHeader });
      window.location.href = "/creator";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  async function seedExample() {
    setError(null);
    try {
      const pos = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          (e) => reject(new Error(e.message)),
          { enableHighAccuracy: true, timeout: 10_000 }
        );
      });
      const data = await apiFetch("/creator/dev/seed-example", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(pos),
      });
      setSeedInfo(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <main className="min-h-screen px-4 pb-8">
      <Nav />
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">📍 Creator</h1>
        <p className="text-sm text-zinc-400">Upload audio, place on map, build tours.</p>

        <div className="rounded border border-zinc-700 bg-black/40 p-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <a href="/login" className="rounded bg-white px-3 py-2 text-sm font-medium text-black">
              Log in
            </a>
            <button onClick={becomeCreator} className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Enable creator mode
            </button>
            <button onClick={seedExample} className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Seed example
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/creator/audio/new" className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Upload audio
            </a>
            <a href="/creator/geofences/new" className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Create geofence
            </a>
            <a href="/creator/geo-audio/new" className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Attach geo-audio
            </a>
            <a href="/creator/tours/new" className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Create tour
            </a>
          </div>
          {seedInfo?.seeded && (
            <div className="text-sm text-zinc-400 space-y-1 pt-2 border-t border-zinc-700">
              <div>✓ Seeded at {Number(seedInfo.seeded.lat).toFixed(5)}, {Number(seedInfo.seeded.lng).toFixed(5)}</div>
              <div className="text-xs">Go to Listener → Share GPS near that point to test.</div>
            </div>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </main>
  );
}
