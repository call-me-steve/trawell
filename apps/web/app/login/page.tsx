"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { setAccessToken } from "../lib/authStore";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Log in" : "Create account"), [mode]);

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
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Email</div>
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="block space-y-1">
          <div className="text-sm text-zinc-300">Password</div>
          <input
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 outline-none focus:border-zinc-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

        <button
          onClick={submit}
          disabled={busy || !email || !password}
          className="w-full rounded-lg bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-950 disabled:opacity-40"
        >
          {busy ? "Working…" : title}
        </button>

        <button
          type="button"
          className="w-full text-sm text-zinc-300 underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}

