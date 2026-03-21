"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { getAccessToken } from "../../lib/authStore";
import { Nav } from "../../components/Nav";

export default function ListenOnePage({ params, searchParams }: any) {
  const geoAudioId = params.geoAudioId as string;
  const lat = searchParams?.lat ? Number(searchParams.lat) : null;
  const lng = searchParams?.lng ? Number(searchParams.lng) : null;

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function requestAccess() {
    setError(null);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Go back, share GPS, then open this from the map.");
      return;
    }
    setBusy(true);
    try {
      const data = (await apiFetch(`/geo-audio/${geoAudioId}/access`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ lat, lng }),
      })) as any;
      setStreamUrl(String(data.streamUrl));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Outside geofence — get within 10m to play");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-8">
      <Nav />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-semibold">🎧 Play</h1>
          <a href="/listen" className="text-sm text-zinc-400 underline">
            ← Back
          </a>
        </div>

        <p className="text-sm text-zinc-400">Playback works only when you’re inside the geofence (10m radius).</p>

        <div className="rounded border border-zinc-700 bg-black/40 p-4 space-y-3">
          <div className="text-sm text-zinc-400">
            Location: {Number.isFinite(lat) && Number.isFinite(lng) ? `${lat?.toFixed(5)}, ${lng?.toFixed(5)}` : "missing"}
          </div>
          <button
            onClick={requestAccess}
            disabled={busy}
            className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            {busy ? "…" : "Check & play"}
          </button>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        {streamUrl ? (
          <audio className="w-full" src={streamUrl} controls autoPlay />
        ) : (
          <div className="text-sm text-zinc-500">Tap “Check & play” when inside the radius.</div>
        )}
      </div>
    </main>
  );
}
