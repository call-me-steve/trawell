"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { getAccessToken } from "../../../lib/authStore";

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

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold">Upload audio</h1>
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
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Audio file</div>
          <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        <button
          onClick={upload}
          disabled={busy || !title || !file}
          className="rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>

        {audioAssetId ? (
          <div className="text-sm text-zinc-200">
            Uploaded. Audio asset id: <span className="font-mono">{audioAssetId}</span>
          </div>
        ) : null}
        {error ? <div className="text-sm text-red-300">{error}</div> : null}
      </div>
    </main>
  );
}

