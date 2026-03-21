"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";
import { Nav } from "../../../components/Nav";

export default function CreatorTourPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tourId, setTourId] = useState<string | null>(null);
  const [geoAudioId, setGeoAudioId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function createTour() {
    setError(null);
    setBusy(true);
    try {
      const data = (await apiFetch("/creator/tours", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ title, description: description || undefined }),
      })) as any;
      setTourId(String(data.tour.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addStop() {
    setError(null);
    if (!tourId) return;
    setBusy(true);
    try {
      await apiFetch(`/creator/tours/${tourId}/stops`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ geoAudioId, sortOrder: Number(sortOrder) }),
      });
      setGeoAudioId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function publishTour() {
    setError(null);
    if (!tourId) return;
    setBusy(true);
    try {
      await apiFetch(`/creator/publish/tour/${tourId}`, { method: "POST", headers: authHeader });
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
          <h1 className="text-xl font-semibold">🗺️ Create tour</h1>
          <a href="/creator" className="text-sm text-zinc-400 underline">
            ← Back
          </a>
        </div>

        <div className="rounded border border-zinc-700 bg-black/40 p-4 space-y-3">
          <label className="block">
            <span className="text-sm text-zinc-400">Title</span>
            <input
              className="mt-1 w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-400">Description</span>
            <textarea
              className="mt-1 w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </label>
          <button
            onClick={createTour}
            disabled={busy || !title}
            className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
          >
            {busy ? "…" : "Create tour"}
          </button>
          {tourId && (
            <div className="text-sm text-zinc-400">
              ✓ Tour ID: <code className="text-zinc-300">{tourId}</code>
            </div>
          )}
        </div>

        {tourId && (
          <div className="rounded border border-zinc-700 bg-black/40 p-4 space-y-3">
            <div className="text-sm text-zinc-400">Add stop (paste geo_audio_id)</div>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                className="w-full rounded border border-zinc-600 bg-black px-3 py-2 font-mono text-sm text-white"
                value={geoAudioId}
                onChange={(e) => setGeoAudioId(e.target.value)}
                placeholder="geo_audio_id"
              />
              <input
                className="rounded border border-zinc-600 bg-black px-3 py-2 text-sm text-white w-20"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
              />
              <div className="flex gap-2">
                <button
                  onClick={addStop}
                  disabled={busy || !geoAudioId}
                  className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
                >
                  Add
                </button>
                <button
                  onClick={publishTour}
                  disabled={busy}
                  className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>
    </main>
  );
}
