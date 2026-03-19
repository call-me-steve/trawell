"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { getAccessToken } from "../../lib/authStore";

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
      setError("Missing location (go back and share GPS first).");
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
      setError(e instanceof Error ? e.message : "Failed to get access");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Listen</h1>
          <p className="text-zinc-300">This will only work inside the geofence.</p>
        </div>
        <a className="text-sm text-zinc-200 underline" href="/listen">
          Back
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <div className="text-sm text-zinc-300">
          Location:{" "}
          {Number.isFinite(lat) && Number.isFinite(lng) ? (
            <span className="text-zinc-100">
              {lat?.toFixed(5)}, {lng?.toFixed(5)}
            </span>
          ) : (
            <span className="text-zinc-500">missing</span>
          )}
        </div>
        <button
          onClick={requestAccess}
          disabled={busy}
          className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
        >
          {busy ? "Checking…" : "Request access & play"}
        </button>
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
      </div>

      {streamUrl ? (
        <audio className="w-full" src={streamUrl} controls autoPlay />
      ) : (
        <div className="text-sm text-zinc-400">No stream URL yet.</div>
      )}
    </main>
  );
}

