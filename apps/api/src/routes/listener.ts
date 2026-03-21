import type { FastifyPluginAsync } from "fastify";
import { LocationSchema } from "@trawell/shared";
import { pool } from "../db/pool.js";
import { presignGetObject } from "../s3/presign.js";

export const listenerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ ok: true }));

  app.get("/map-items", async (req) => {
    const q = req.query as any as { lat?: string; lng?: string; radius?: string };
    const lat = Number(q.lat);
    const lng = Number(q.lng);
    const radius = Number(q.radius ?? "5000");
    LocationSchema.parse({ lat, lng });
    if (!Number.isFinite(radius) || radius <= 0 || radius > 50_000) {
      const err = new Error("Invalid radius");
      (err as any).statusCode = 400;
      throw err;
    }
    const res = await pool.query(
      `
      select
        ga.id as geo_audio_id,
        aa.title,
        aa.description,
        g.radius_m,
        ST_Y(g.center_geog::geometry) as lat,
        ST_X(g.center_geog::geometry) as lng,
        coalesce(cp.display_name, u.email) as author
      from geo_audio ga
      join audio_assets aa on aa.id = ga.audio_asset_id
      join users u on u.id = aa.owner_user_id
      left join creator_profiles cp on cp.user_id = u.id
      join geofences g on g.id = ga.geofence_id
      where ga.published_at is not null
        and ga.visibility = 'public'
        and ST_DWithin(g.center_geog, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)
      order by ST_Distance(g.center_geog, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography)
      limit 100
      `,
      [lng, lat, radius]
    );
    return { items: res.rows };
  });

  app.get("/geo-audio/:id", async (req) => {
    const { id } = req.params as any as { id: string };
    const res = await pool.query(
      `
      select
        ga.id as geo_audio_id,
        aa.title,
        aa.description,
        g.radius_m,
        ST_Y(g.center_geog::geometry) as lat,
        ST_X(g.center_geog::geometry) as lng,
        coalesce(cp.display_name, u.email) as author
      from geo_audio ga
      join audio_assets aa on aa.id = ga.audio_asset_id
      join users u on u.id = aa.owner_user_id
      left join creator_profiles cp on cp.user_id = u.id
      join geofences g on g.id = ga.geofence_id
      where ga.id = $1 and ga.published_at is not null and ga.visibility in ('public','unlisted')
      `,
      [id]
    );
    if (res.rowCount === 0) {
      const err = new Error("Not found");
      (err as any).statusCode = 404;
      throw err;
    }
    return res.rows[0];
  });

  app.get("/nearby", async (req) => {
    const q = req.query as any as { lat?: string; lng?: string; radius?: string };
    const lat = Number(q.lat);
    const lng = Number(q.lng);
    const radius = Number(q.radius ?? "2000");
    LocationSchema.parse({ lat, lng });
    if (!Number.isFinite(radius) || radius <= 0 || radius > 50_000) {
      const err = new Error("Invalid radius");
      (err as any).statusCode = 400;
      throw err;
    }

    const res = await pool.query(
      `
      select
        ga.id as geo_audio_id,
        aa.title as title,
        aa.description as description,
        g.id as geofence_id,
        g.radius_m as radius_m,
        ST_Distance(g.center_geog, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography) as distance_m
      from geo_audio ga
      join audio_assets aa on aa.id = ga.audio_asset_id
      join geofences g on g.id = ga.geofence_id
      where ga.published_at is not null
        and ga.visibility = 'public'
        and ST_DWithin(g.center_geog, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, $3)
      order by distance_m asc
      limit 100
      `,
      [lng, lat, radius]
    );

    const tours = await pool.query(
      `
      select
        t.id,
        t.title,
        t.description,
        count(ts.id)::int as stops_count
      from tours t
      left join tour_stops ts on ts.tour_id = t.id
      where t.published_at is not null
      group by t.id
      order by t.created_at desc
      limit 50
      `
    );

    return { geoAudio: res.rows, tours: tours.rows };
  });

  app.get("/tours/:id", async (req) => {
    const { id } = req.params as any as { id: string };
    const tour = await pool.query(`select id, title, description, published_at from tours where id=$1`, [id]);
    if (tour.rowCount === 0) {
      const err = new Error("Not found");
      (err as any).statusCode = 404;
      throw err;
    }
    const stops = await pool.query(
      `
      select
        ts.id,
        ts.sort_order,
        ts.stop_title,
        ts.stop_notes,
        ga.id as geo_audio_id,
        aa.title as audio_title,
        aa.description as audio_description
      from tour_stops ts
      join geo_audio ga on ga.id = ts.geo_audio_id
      join audio_assets aa on aa.id = ga.audio_asset_id
      where ts.tour_id = $1
      order by ts.sort_order asc
      `,
      [id]
    );
    return { tour: tour.rows[0], stops: stops.rows };
  });

  app.post("/geo-audio/:id/access", async (req) => {
    const { id } = req.params as any as { id: string };
    const input = LocationSchema.parse(req.body);

    const res = await pool.query(
      `
      select
        aa.storage_key,
        g.center_geog,
        g.radius_m
      from geo_audio ga
      join audio_assets aa on aa.id = ga.audio_asset_id
      join geofences g on g.id = ga.geofence_id
      where ga.id = $1
        and ga.published_at is not null
        and ga.visibility in ('public','unlisted')
      `,
      [id]
    );
    if (res.rowCount === 0) {
      const err = new Error("Not found");
      (err as any).statusCode = 404;
      throw err;
    }

    const { storage_key, radius_m } = res.rows[0] as { storage_key: string; radius_m: number };
    const within = await pool.query(
      `
      select ST_DWithin(
        g.center_geog,
        ST_SetSRID(ST_MakePoint($1,$2),4326)::geography,
        g.radius_m
      ) as ok
      from geo_audio ga
      join geofences g on g.id = ga.geofence_id
      where ga.id = $3
      `,
      [input.lng, input.lat, id]
    );
    if (!within.rows[0]?.ok) {
      const err = new Error(`Outside geofence (radius_m=${radius_m})`);
      (err as any).statusCode = 403;
      throw err;
    }

    const signed = await presignGetObject({ key: storage_key });
    return { streamUrl: signed.url, ttlSeconds: undefined };
  });
};

