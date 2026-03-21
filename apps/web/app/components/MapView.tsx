"use client";

import { useCallback, useState } from "react";
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 };
const DEFAULT_ZOOM = 14;

type MapItem = {
  geo_audio_id: string;
  title: string;
  description: string | null;
  radius_m: number;
  lat: number;
  lng: number;
  author: string | null;
};

type Props = {
  center: { lat: number; lng: number };
  items: MapItem[];
  userPos: { lat: number; lng: number } | null;
  onItemSelect?: (item: MapItem) => void;
  className?: string;
};

export function MapView({ center, items, userPos, onItemSelect, className = "" }: Props) {
  const [selected, setSelected] = useState<MapItem | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const onMarkerClick = useCallback((item: MapItem) => {
    setSelected(item);
  }, []);

  if (loadError || !apiKey) {
    return (
      <div className={`rounded border border-zinc-700 bg-zinc-900/40 p-8 text-center ${className}`}>
        <div className="text-zinc-400">Map unavailable — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className={`rounded border border-zinc-700 bg-zinc-900/40 p-8 text-center text-zinc-400 ${className}`}>Loading map…</div>;
  }

  return (
    <div className={`overflow-hidden rounded border border-zinc-700 ${className}`}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", minHeight: 320 }}
        center={center}
        zoom={DEFAULT_ZOOM}
        options={{ streetViewControl: false, fullscreenControl: true, mapTypeControl: false }}
      >
        {userPos && <Marker position={userPos} title="You" />}
        {items.map((item) => (
          <Marker
            key={item.geo_audio_id}
            position={{ lat: item.lat, lng: item.lng }}
            onClick={() => onMarkerClick(item)}
          />
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ minWidth: 200, maxWidth: 280, padding: 8, color: "#000" }}>
              <div style={{ fontWeight: 600 }}>{selected.title}</div>
              {selected.author && <div style={{ fontSize: 13, color: "#666" }}>by {selected.author}</div>}
              {selected.description && <div style={{ marginTop: 4, fontSize: 13, color: "#555" }}>{selected.description}</div>}
              <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>Radius: {selected.radius_m}m — play when inside</div>
              {onItemSelect && (
                <button
                  onClick={() => onItemSelect(selected)}
                  style={{ marginTop: 8, width: "100%", padding: "6px 8px", background: "#000", color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 500 }}
                >
                  Open
                </button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
