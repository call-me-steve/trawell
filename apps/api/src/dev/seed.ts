import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../db/pool.js";
import { env } from "../env.js";
import { s3 } from "../s3/client.js";
import { makeSineWav } from "./makeWav.js";

export async function seedExampleForUser(params: { userId: string; lat: number; lng: number }) {
  const wav = makeSineWav({ seconds: 2.0, freqHz: 440 });
  const audioId = crypto.randomUUID();
  const geofenceId = crypto.randomUUID();
  const geoAudioId = crypto.randomUUID();
  const tourId = crypto.randomUUID();

  const storageKey = `${params.userId}/seed-${audioId}.wav`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: storageKey,
      ContentType: "audio/wav",
      Body: wav,
    })
  );

  await pool.query("begin");
  try {
    await pool.query(
      `insert into audio_assets(id, owner_user_id, title, description, mime_type, storage_bucket, storage_key)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        audioId,
        params.userId,
        "Seed example: 2s tone",
        "Generated locally for testing geofencing.",
        "audio/wav",
        env.S3_BUCKET,
        storageKey,
      ]
    );

    await pool.query(
      `insert into geofences(id, owner_user_id, name, center_geog, radius_m)
       values ($1,$2,$3, ST_SetSRID(ST_MakePoint($4,$5),4326)::geography, $6)`,
      [geofenceId, params.userId, "Seed geofence", params.lng, params.lat, 250]
    );

    await pool.query(
      `insert into geo_audio(id, audio_asset_id, geofence_id, visibility, published_at)
       values ($1,$2,$3,'public', now())`,
      [geoAudioId, audioId, geofenceId]
    );

    await pool.query(
      `insert into tours(id, owner_user_id, title, description, published_at)
       values ($1,$2,$3,$4, now())`,
      [tourId, params.userId, "Seed tour", "One-stop tour to validate end-to-end flow.",]
    );

    await pool.query(
      `insert into tour_stops(tour_id, geo_audio_id, sort_order, stop_title)
       values ($1,$2,0,$3)`,
      [tourId, geoAudioId, "Seed stop"]
    );

    await pool.query("commit");
  } catch (e) {
    await pool.query("rollback");
    throw e;
  }

  return { audioId, geofenceId, geoAudioId, tourId, lat: params.lat, lng: params.lng };
}

