# Trawell

Location-based audio tour MVP: creators upload geo-restricted audio and place it on a map; listeners explore the map, tap markers for author/description, and can play audio only when physically within the geofence (default 10m radius).

## What's in this repo

- **Web app** (`apps/web`): Next.js with Listener + Creator sections, Google Maps integration
- **API** (`apps/api`): Fastify for auth, geofencing, tours, S3/MinIO signed URLs
- **DB**: Postgres + PostGIS (`db/migrations`)
- **Object storage**: MinIO (`docker-compose.yml`)

## Local development

### Prereqs

- Node.js 20+
- `pnpm`
- Docker Desktop

### Environment variables

**API** (required):

```bash
cp apps/api/.env.example apps/api/.env
```

**Web** (optional, for maps): create `apps/web/.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

Get a key at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and enable Maps JavaScript API. Without it, map picker shows a fallback; lat/lng inputs still work.

### Start everything

```bash
cd trawell
pnpm install
pnpm start
```

Starts Postgres+PostGIS, MinIO, runs migrations, and boots API + web in dev mode.

### URLs

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:4000`
- **MinIO console**: `http://localhost:9001` (default: `minioadmin` / `minioadmin`)

## Quick start with test accounts

1. Open `http://localhost:3000/login`
2. Click **Seed test accounts** (dev only)
3. Log in as **creator@test.com** / creator123, choose **Creator**
4. **Enable creator mode** → **Seed example** (places audio at your location)
5. New tab: log in as **listener@test.com** / listener123, choose **Listener**
6. **Share GPS** or use **Dev override** with the seed lat/lng
7. Tap a map marker → **Open** → **Check & play** (works only within 10m)

## Docs

- [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md) — setup, test accounts, troubleshooting
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, data flows
- [docs/API.md](docs/API.md) — endpoints, request/response examples
- [HANDOFF.md](HANDOFF.md) — project summary for handoff to a new chat
