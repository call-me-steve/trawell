"use client";

import { useCallback, useState } from "react";
import { useJsApiLoader, GoogleMap, Circle, Marker } from "@react-google-maps/api";

const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 };
const DEFAULT_ZOOM = 15;

type Props = {
  center: { lat: number; lng: number } | null;
  radiusM: number;
  onPlace: (lat: number, lng: number) => void;
  className?: string;
};

export function MapPicker({ center, radiusM, onPlace, className = "" }: Props) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat != null && lng != null) onPlace(lat, lng);
    },
    [onPlace]
  );

  const onLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  if (loadError || !apiKey) {
    return (
      <div className={`rounded border border-zinc-700 bg-zinc-900/40 p-8 text-center ${className}`}>
        <div className="text-zinc-400">Map unavailable — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</div>
        <div className="mt-2 text-sm text-zinc-500">Or use the lat/lng inputs below.</div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className={`rounded border border-zinc-700 bg-zinc-900/40 p-8 text-center text-zinc-400 ${className}`}>Loading map…</div>;
  }

  const c = center ?? DEFAULT_CENTER;

  return (
    <div className={`overflow-hidden rounded border border-zinc-700 ${className}`}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%", minHeight: 280 }}
        center={c}
        zoom={DEFAULT_ZOOM}
        onClick={onMapClick}
        onLoad={onLoad}
        options={{ streetViewControl: false, fullscreenControl: true, mapTypeControl: false }}
      >
        {center && (
          <>
            <Marker position={center} />
            <Circle center={center} radius={radiusM} options={{ strokeColor: "#fff", fillColor: "#fff", fillOpacity: 0.2, strokeWeight: 2 }} />
          </>
        )}
      </GoogleMap>
    </div>
  );
}
