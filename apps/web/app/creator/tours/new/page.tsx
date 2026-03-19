"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";

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
    <main className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Create tour</h1>
        <a className="text-sm text-zinc-200 underline" href="/creator">
          Back
        </a>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Title</div>
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Description</div>
          <textarea
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <button
          onClick={createTour}
          disabled={busy || !title}
          className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
        >
          {busy ? "Working…" : "Create tour"}
        </button>
        {tourId ? (
          <div className="text-sm text-zinc-200">
            Tour id: <span className="font-mono">{tourId}</span>
          </div>
        ) : null}
      </div>

      {tourId ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
          <div className="text-sm text-zinc-300">Add stop (paste a `geo_audio_id` you created)</div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="md:col-span-2 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600 font-mono text-sm"
              value={geoAudioId}
              onChange={(e) => setGeoAudioId(e.target.value)}
              placeholder="geo_audio_id"
            />
            <input
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="sort order"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addStop}
              disabled={busy || !geoAudioId}
              className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
            >
              Add stop
            </button>
            <button
              onClick={publishTour}
              disabled={busy}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 disabled:opacity-40"
            >
              Publish tour
            </button>
          </div>
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
    </main>
  );
}

