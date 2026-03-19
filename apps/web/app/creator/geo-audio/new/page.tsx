"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";

export default function CreatorAttachGeoAudioPage() {
  const [audioAssetId, setAudioAssetId] = useState("");
  const [geofenceId, setGeofenceId] = useState("");
  const [visibility, setVisibility] = useState<"private" | "unlisted" | "public">("public");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoAudioId, setGeoAudioId] = useState<string | null>(null);

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function attach() {
    setError(null);
    setBusy(true);
    try {
      const data = (await apiFetch("/creator/geo-audio", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ audioAssetId, geofenceId, visibility }),
      })) as any;
      setGeoAudioId(String(data.geoAudio.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setError(null);
    if (!geoAudioId) return;
    setBusy(true);
    try {
      await apiFetch(`/creator/publish/geo-audio/${geoAudioId}`, { method: "POST", headers: authHeader });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Attach audio to geofence</h1>
        <a className="text-sm text-zinc-200 underline" href="/creator">
          Back
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <input
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600 font-mono text-sm"
          value={audioAssetId}
          onChange={(e) => setAudioAssetId(e.target.value)}
          placeholder="audio_asset_id"
        />
        <input
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600 font-mono text-sm"
          value={geofenceId}
          onChange={(e) => setGeofenceId(e.target.value)}
          placeholder="geofence_id"
        />
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Visibility</div>
          <select
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as any)}
          >
            <option value="private">private</option>
            <option value="unlisted">unlisted</option>
            <option value="public">public</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button
            onClick={attach}
            disabled={busy || !audioAssetId || !geofenceId}
            className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
          >
            {busy ? "Working…" : "Attach"}
          </button>
          <button
            onClick={publish}
            disabled={busy || !geoAudioId}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 disabled:opacity-40"
          >
            Publish geo-audio
          </button>
        </div>

        {geoAudioId ? (
          <div className="text-sm text-zinc-200">
            Geo-audio id: <span className="font-mono">{geoAudioId}</span>
          </div>
        ) : null}
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
      </div>
    </main>
  );
}

