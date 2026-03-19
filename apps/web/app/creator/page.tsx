"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/authStore";

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
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Creator</h1>
          <p className="text-zinc-300">Upload audio, attach it to a geofence, and build tours.</p>
        </div>
        <a className="text-sm text-zinc-200 underline" href="/">
          Back
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="text-sm text-zinc-300">
          First, log in. Then you can enable creator mode and start uploading.
        </div>
        <div className="flex gap-2">
          <a className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950" href="/login">
            Log in
          </a>
          <button
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
            onClick={becomeCreator}
          >
            Enable creator mode
          </button>
          <button
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
            onClick={seedExample}
          >
            Seed local example
          </button>
          <a className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100" href="/creator/audio/new">
            Upload audio
          </a>
          <a className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100" href="/creator/geofences/new">
            Create geofence
          </a>
          <a className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100" href="/creator/geo-audio/new">
            Attach geo-audio
          </a>
          <a className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100" href="/creator/tours/new">
            Create tour
          </a>
        </div>
        {seedInfo?.seeded ? (
          <div className="text-xs text-zinc-300 space-y-1">
            <div>
              Seeded geo audio: <span className="font-mono">{seedInfo.seeded.geoAudioId}</span>
            </div>
            <div>
              Seed location:{" "}
              <span className="font-mono">
                {Number(seedInfo.seeded.lat).toFixed(5)},{Number(seedInfo.seeded.lng).toFixed(5)}
              </span>
            </div>
            <div className="text-zinc-400">Go to Listener → Share GPS near this point to test playback.</div>
          </div>
        ) : null}
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
      </div>
    </main>
  );
}

