"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";
import { Nav } from "../../../components/Nav";

export default function CreatorUploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [audioAssetId, setAudioAssetId] = useState<string | null>(null);

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function upload() {
    setError(null);
    if (!file) {
      setError("Pick an audio file first.");
      return;
    }
    setBusy(true);
    try {
      const init = (await apiFetch("/creator/audio/init-upload", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({
          title,
          description: description || undefined,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      })) as any;

      const url = String(init.uploadUrl);
      const put = await fetch(url, { method: "PUT", body: file, headers: { "content-type": file.type } });
      if (!put.ok) throw new Error(`Upload failed (HTTP ${put.status})`);
      setAudioAssetId(String(init.audioAsset.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function useSample() {
    setError(null);
    setBusy(true);
    try {
      const data = (await apiFetch("/creator/dev/sample-audio", { method: "POST", headers: authHeader })) as any;
      setTitle("Sample: 2s tone");
      setDescription("Quick test audio.");
      setAudioAssetId(String(data.audioId));
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
          <h1 className="text-xl font-semibold">🎵 Upload audio</h1>
          <a href="/creator" className="text-sm text-zinc-400 underline">
            ← Back
          </a>
        </div>

        <p className="text-sm text-zinc-400">Upload a file from your machine, or use a 2s sample for quick testing.</p>

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
          <label className="block">
            <span className="text-sm text-zinc-400">Audio file (from your machine)</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-black"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={upload}
              disabled={busy || !title || !file}
              className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
            >
              {busy ? "…" : "Upload"}
            </button>
            <button onClick={useSample} disabled={busy} className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Use sample
            </button>
          </div>
          {audioAssetId && (
            <div className="text-sm text-zinc-400">
              ✓ Audio ID: <code className="text-zinc-300">{audioAssetId}</code>
            </div>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>
      </div>
    </main>
  );
}
