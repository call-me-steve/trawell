"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { getAccessToken } from "../lib/authStore";
import { Nav } from "../components/Nav";
import { MapView } from "../components/MapView";

type MapItem = {
  geo_audio_id: string;
  title: string;
  description: string | null;
  radius_m: number;
  lat: number;
  lng: number;
  author: string | null;
};

export default function ListenPage() {
  const router = useRouter();
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<MapItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [overrideLat, setOverrideLat] = useState("");
  const [overrideLng, setOverrideLng] = useState("");

  const canUseGeo = typeof navigator !== "undefined" && "geolocation" in navigator;
  const isDev = process.env.NODE_ENV !== "production";

  const authHeader = useMemo(() => {
    const token = getAccessToken();
    return token ? { authorization: `Bearer ${token}` } : {};
  }, []);

  async function requestLocation() {
    setError(null);
    if (!canUseGeo) {
      setError("Geolocation not available");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  function applyOverride() {
    setError(null);
    const lat = Number(overrideLat);
    const lng = Number(overrideLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError("Invalid lat/lng");
      return;
    }
    setPos({ lat, lng });
  }

  useEffect(() => {
    if (!pos) return;
    (async () => {
      setBusy(true);
      try {
        const data = (await apiFetch(`/map-items?lat=${pos.lat}&lng=${pos.lng}&radius=5000`, {
          headers: authHeader,
        })) as any;
        setItems((data.items ?? []) as MapItem[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setBusy(false);
      }
    })();
  }, [pos, authHeader]);

  function onItemSelect(item: MapItem) {
    const q = pos ? `?lat=${pos.lat}&lng=${pos.lng}` : "";
    router.push(`/listen/${item.geo_audio_id}${q}`);
  }

  const center = pos ?? { lat: 48.8566, lng: 2.3522 };

  return (
    <main className="min-h-screen px-4 pb-8">
      <Nav />
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">🎧 Listener</h1>
        <p className="text-sm text-zinc-400">See spots on the map. Tap a marker for author & description. Play only when you’re inside the radius (10m).</p>

        <div className="rounded border border-zinc-700 bg-black/40 p-4 space-y-3">
          <div className="text-sm text-zinc-400">
            Location: {pos ? `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : "not set"}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={requestLocation} className="rounded bg-white px-3 py-2 text-sm font-medium text-black">
              Share GPS
            </button>
            <a href="/login" className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
              Log in
            </a>
          </div>
          {isDev && (
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                className="rounded border border-zinc-600 bg-black px-3 py-2 text-sm text-white"
                value={overrideLat}
                onChange={(e) => setOverrideLat(e.target.value)}
                placeholder="lat"
              />
              <input
                className="rounded border border-zinc-600 bg-black px-3 py-2 text-sm text-white"
                value={overrideLng}
                onChange={(e) => setOverrideLng(e.target.value)}
                placeholder="lng"
              />
              <button onClick={applyOverride} className="rounded border border-zinc-600 px-3 py-2 text-sm text-zinc-300">
                Set
              </button>
            </div>
          )}
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        {busy && <div className="text-sm text-zinc-500">Loading map…</div>}

        <MapView
          center={center}
          items={items}
          userPos={pos}
          onItemSelect={onItemSelect}
          className="h-[360px] w-full"
        />

        {items.length > 0 && (
          <div className="rounded border border-zinc-700 p-3">
            <div className="text-sm text-zinc-400">
              {items.length} spot{items.length !== 1 ? "s" : ""} near you — tap map markers for details
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
