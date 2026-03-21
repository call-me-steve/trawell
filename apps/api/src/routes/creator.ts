import type { FastifyPluginAsync } from "fastify";
import crypto from "node:crypto";
import {
  AttachGeoAudioSchema,
  CreateGeofenceSchema,
  CreateTourSchema,
  AddTourStopSchema,
  InitAudioUploadSchema,
} from "@trawell/shared";
import { pool } from "../db/pool.js";
import { requireCreator } from "../http/authPlugin.js";
import { presignPutObject } from "../s3/presign.js";
import { env } from "../env.js";
import { seedExampleForUser, createSampleAudio } from "../dev/seed.js";

export const creatorRoutes: FastifyPluginAsync = async (app) => {
  app.post("/profile/become", async (req) => {
    // Any authenticated user can become a creator for MVP
    if (!req.user) {
      const err = new Error("Unauthorized");
      (err as any).statusCode = 401;
      throw err;
    }
    await pool.query(`update users set role='creator' where id=$1`, [req.user.id]);
    await pool.query(`insert into creator_profiles(user_id) values($1) on conflict do nothing`, [req.user.id]);
    return { ok: true };
  });

  app.post("/dev/seed-example", async (req) => {
    requireCreator(req);
    if (env.NODE_ENV !== "development") {
      const err = new Error("Not available");
      (err as any).statusCode = 404;
      throw err;
    }
    const input = req.body as any;
    const lat = Number(input?.lat);
    const lng = Number(input?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const err = new Error("lat/lng required");
      (err as any).statusCode = 400;
      throw err;
    }
    const seeded = await seedExampleForUser({ userId: req.user.id, lat, lng });
    return { ok: true, seeded };
  });

  app.post("/dev/sample-audio", async (req) => {
    requireCreator(req);
    if (env.NODE_ENV !== "development") {
      const err = new Error("Not available");
      (err as any).statusCode = 404;
      throw err;
    }
    const { audioId } = await createSampleAudio({ userId: req.user.id });
    return { ok: true, audioId };
  });

  app.post("/geofences", async (req) => {
    requireCreator(req);
    const input = CreateGeofenceSchema.parse(req.body);
    const { lat, lng } = input.center;

    const res = await pool.query(
      `insert into geofences(owner_user_id, name, center_geog, radius_m)
       values ($1, $2, ST_SetSRID(ST_MakePoint($3,$4),4326)::geography, $5)
       returning id, owner_user_id, name, radius_m, created_at`,
      [req.user.id, input.name ?? null, lng, lat, input.radiusM]
    );
    return { geofence: res.rows[0] };
  });

  app.post("/audio/init-upload", async (req) => {
    requireCreator(req);
    const input = InitAudioUploadSchema.parse(req.body);

    const id = crypto.randomUUID();
    const key = `${req.user.id}/${id}`;
    const presign = await presignPutObject({ key, contentType: input.mimeType });

    const res = await pool.query(
      `insert into audio_assets(id, owner_user_id, title, description, mime_type, storage_bucket, storage_key)
       values ($1,$2,$3,$4,$5,$6,$7)
       returning id, title, description, mime_type, storage_bucket, storage_key, created_at`,
      [id, req.user.id, input.title, input.description ?? null, input.mimeType, presign.bucket, presign.key]
    );

    return { audioAsset: res.rows[0], uploadUrl: presign.url };
  });

  app.post("/geo-audio", async (req) => {
    requireCreator(req);
    const input = AttachGeoAudioSchema.parse(req.body);

    // Ensure creator owns both entities
    const a = await pool.query(`select id from audio_assets where id=$1 and owner_user_id=$2`, [
      input.audioAssetId,
      req.user.id,
    ]);
    const g = await pool.query(`select id from geofences where id=$1 and owner_user_id=$2`, [
      input.geofenceId,
      req.user.id,
    ]);
    if (a.rowCount === 0 || g.rowCount === 0) {
      return (app as any).httpErrors?.forbidden?.() ?? (() => {
        const err = new Error("Forbidden");
        (err as any).statusCode = 403;
        throw err;
      })();
    }

    const res = await pool.query(
      `insert into geo_audio(audio_asset_id, geofence_id, visibility)
       values ($1,$2,$3)
       on conflict (audio_asset_id, geofence_id) do update set visibility=excluded.visibility
       returning id, audio_asset_id, geofence_id, visibility, published_at, created_at`,
      [input.audioAssetId, input.geofenceId, input.visibility]
    );
    return { geoAudio: res.rows[0] };
  });

  app.post("/tours", async (req) => {
    requireCreator(req);
    const input = CreateTourSchema.parse(req.body);
    const res = await pool.query(
      `insert into tours(owner_user_id, title, description)
       values ($1,$2,$3)
       returning id, title, description, published_at, created_at`,
      [req.user.id, input.title, input.description ?? null]
    );
    return { tour: res.rows[0] };
  });

  app.post("/tours/:id/stops", async (req) => {
    requireCreator(req);
    const tourId = (req.params as any).id as string;
    const input = AddTourStopSchema.parse(req.body);

    const t = await pool.query(`select id from tours where id=$1 and owner_user_id=$2`, [tourId, req.user.id]);
    if (t.rowCount === 0) {
      const err = new Error("Forbidden");
      (err as any).statusCode = 403;
      throw err;
    }

    // Ensure geoAudio belongs to creator (via geofence owner)
    const ga = await pool.query(
      `select ga.id
       from geo_audio ga
       join geofences g on g.id = ga.geofence_id
       where ga.id=$1 and g.owner_user_id=$2`,
      [input.geoAudioId, req.user.id]
    );
    if (ga.rowCount === 0) {
      const err = new Error("Forbidden");
      (err as any).statusCode = 403;
      throw err;
    }

    const res = await pool.query(
      `insert into tour_stops(tour_id, geo_audio_id, sort_order, stop_title, stop_notes)
       values ($1,$2,$3,$4,$5)
       on conflict (tour_id, geo_audio_id) do update
         set sort_order=excluded.sort_order,
             stop_title=excluded.stop_title,
             stop_notes=excluded.stop_notes
       returning id, tour_id, geo_audio_id, sort_order, stop_title, stop_notes, created_at`,
      [tourId, input.geoAudioId, input.sortOrder, input.stopTitle ?? null, input.stopNotes ?? null]
    );
    return { stop: res.rows[0] };
  });

  app.post("/publish/:entity/:id", async (req) => {
    requireCreator(req);
    const { entity, id } = req.params as any as { entity: string; id: string };
    if (entity === "geo-audio") {
      const res = await pool.query(
        `update geo_audio ga
         set published_at = now()
         from geofences g
         where ga.id=$1 and g.id=ga.geofence_id and g.owner_user_id=$2
         returning ga.id, ga.published_at`,
        [id, req.user.id]
      );
      if (res.rowCount === 0) return { ok: false };
      return { ok: true, geoAudio: res.rows[0] };
    }
    if (entity === "tour") {
      const res = await pool.query(
        `update tours set published_at=now() where id=$1 and owner_user_id=$2 returning id, published_at`,
        [id, req.user.id]
      );
      if (res.rowCount === 0) return { ok: false };
      return { ok: true, tour: res.rows[0] };
    }
    const err = new Error("Unknown entity");
    (err as any).statusCode = 400;
    throw err;
  });
};

