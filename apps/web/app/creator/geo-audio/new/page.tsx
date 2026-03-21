"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";
import { Nav } from "../../../components/Nav";

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
    <main className="min-h-screen px-4 pb-8">
      <Nav />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-semibold">🔗 Attach audio to geofence</h1>
          <a href="/creator" className="text-sm text-zinc-400 underline">
            ← Back
          </a>
        </div>

        <p className="text-sm text-zinc-400">Paste audio & geofence IDs from Upload and Create geofence.</p>

        <div className="rounded border border-zinc-700 bg-black/40 p-4 space-y-3">
          <input
            className="w-full rounded border border-zinc-600 bg-black px-3 py-2 font-mono text-sm text-white"
            value={audioAssetId}
            onChange={(e) => setAudioAssetId(e.target.value)}
            placeholder="audio_asset_id"
          />
          <input
            className="w-full rounded border border-zinc-600 bg-black px-3 py-2 font-mono text-sm text-white"
            value={geofenceId}
            onChange={(e) => setGeofenceId(e.target.value)}
            placeholder="geofence_id"
          />
          <label className="block">
            <span className="text-sm text-zinc-400">Visibility</span>
            <select
              className="mt-1 w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white"
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
              className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
            >
              {busy ? "…" : "Attach"}
            </button>
            <button
              onClick={publish}
              disabled={busy || !geoAudioId}
              className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300"
            >
              Publish
            </button>
          </div>
          {geoAudioId && (
            <div className="text-sm text-zinc-400">
              ✓ Geo-audio ID: <code className="text-zinc-300">{geoAudioId}</code>
            </div>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </main>
  );
}
