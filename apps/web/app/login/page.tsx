"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../lib/api";
import { setAccessToken } from "../lib/authStore";

type ViewMode = "creator" | "listener";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("listener");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [seedOk, setSeedOk] = useState<boolean | null>(null);

  useEffect(() => {
    const m = searchParams?.get("mode");
    if (m === "creator" || m === "listener") setViewMode(m);
  }, [searchParams]);

  const title = useMemo(() => (mode === "login" ? "Log in" : "Create account"), [mode]);

  async function seedTestAccounts() {
    setError(null);
    try {
      const data = (await apiFetch("/dev/seed-test-accounts", { method: "POST" })) as any;
      setSeedOk(true);
    } catch {
      setSeedOk(false);
    }
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const data = (await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })) as any;
      if (data.accessToken) setAccessToken(data.accessToken);
      const dest = viewMode === "creator" ? "/creator" : "/listen";
      window.location.href = dest;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Trawell</h1>

      <div className="rounded border border-zinc-700 bg-zinc-900/60 p-4">
        <div className="mb-3 text-sm text-zinc-400">Enter as</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode("creator")}
            className={`flex-1 rounded px-3 py-2 text-sm ${viewMode === "creator" ? "bg-white text-black" : "border border-zinc-600 text-zinc-300"}`}
          >
            Creator
          </button>
          <button
            type="button"
            onClick={() => setViewMode("listener")}
            className={`flex-1 rounded px-3 py-2 text-sm ${viewMode === "listener" ? "bg-white text-black" : "border border-zinc-600 text-zinc-300"}`}
          >
            Listener
          </button>
        </div>
        <div className="mt-1 text-xs text-zinc-500">
          {viewMode === "creator" ? "Upload audio & place on map" : "Explore map & listen on-site"}
        </div>
      </div>

      <div className="rounded border border-zinc-700 bg-zinc-900/60 p-4 space-y-3">
        <label className="block">
          <div className="text-sm text-zinc-400 mb-1">Email</div>
          <input
            className="w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white outline-none focus:border-zinc-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <div className="text-sm text-zinc-400 mb-1">Password</div>
          <input
            className="w-full rounded border border-zinc-600 bg-black px-3 py-2 text-white outline-none focus:border-zinc-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button
          onClick={submit}
          disabled={busy || !email || !password}
          className="w-full rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-40"
        >
          {busy ? "…" : title}
        </button>

        <button
          type="button"
          className="w-full text-sm text-zinc-400 underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Register" : "Already have one? Log in"}
        </button>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <div className="rounded border border-zinc-700 p-3">
          <button type="button" onClick={seedTestAccounts} className="text-sm text-zinc-400 underline">
            Seed test accounts
          </button>
          {seedOk === true && <span className="ml-2 text-xs text-zinc-500">creator@test.com / creator123 · listener@test.com / listener123</span>}
        </div>
      )}

      <a href="/" className="block text-center text-sm text-zinc-500">
        Back
      </a>
    </main>
  );
}
