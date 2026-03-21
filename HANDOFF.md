# Trawell — Handoff Summary

Use this document when continuing work on Trawell in a new chat.

## What Trawell Is

A geofenced audio tour MVP. **Creators** upload audio, place it on a map (pick a spot + radius), and publish. **Listeners** see markers on the map, tap for author/description, and can play audio **only when physically inside the geofence** (default 10m). Designed for future iOS/Android + offline tour bundles.

## Tech Stack

- **Monorepo** (pnpm workspaces): `apps/web`, `apps/api`, `packages/shared`
- **Web**: Next.js 15, Tailwind, `@react-google-maps/api`
- **API**: Fastify, Postgres+PostGIS, MinIO (S3-compatible)
- **Auth**: JWT access + refresh cookie, bcrypt passwords

## Key Paths

| Path | Purpose |
|------|---------|
| `apps/web/app/page.tsx` | Home: Creator / Listener entry |
| `apps/web/app/login/page.tsx` | Login, Creator\|Listener mode toggle, Seed test accounts |
| `apps/web/app/listen/page.tsx` | Listener map with markers |
| `apps/web/app/creator/geofences/new/page.tsx` | Creator map picker (click to place) |
| `apps/api/src/routes/` | Auth, creator, listener, dev routes |
| `db/migrations/` | SQL migrations (PostGIS) |

## Data Model (PostGIS)

- `users` — email, password_hash, role (listener/creator)
- `geofences` — center_geog, radius_m (10m default)
- `audio_assets` — title, storage_key (MinIO)
- `geo_audio` — links audio to geofence, visibility, published_at
- `tours`, `tour_stops` — guided tours
- `purchases` — stubbed for future paid tours

## Test Accounts (Dev Only)

| Email | Password | Role |
|-------|----------|------|
| creator@test.com | creator123 | creator |
| listener@test.com | listener123 | listener |

Seed via `POST /dev/seed-test-accounts` or the login-page button.

## Env Vars

- **API** (`apps/api/.env`): DATABASE_URL, JWT_*, S3_*, CORS_ORIGIN
- **Web** (`apps/web/.env.local`): `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (optional; maps need it)

## Run Locally

```bash
pnpm start   # Docker + migrate + dev
# or
docker compose up -d && pnpm db:migrate && pnpm dev
```

## Planned / Not Yet Built

- Paid tours (data model ready; no Stripe)
- Tour bundle download for offline (mobile)
- Creator lists (audio assets, geofences, geo-audio) — currently paste IDs
- PWA / installable web
- React Native app

## Notes

- Geofence radius default: 10m (schema + UI)
- Map fallback: if no Google key, lat/lng inputs still work
- Dev override on listener page: set lat/lng without real GPS for testing
