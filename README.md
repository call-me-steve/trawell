# Trawell

Location-based audio tour MVP: creators upload geo-restricted audio; listeners can play audio only when physically within a geofence.

## What’s in this repo

- **Web app**: Next.js (`apps/web`) with Listener + Creator sections
- **API**: Fastify (`apps/api`) for auth, geofencing checks, tours, and S3/MinIO signing
- **DB**: Postgres + PostGIS (`db/migrations`)
- **Object storage**: MinIO (`docker-compose.yml`)

## Local development

### Prereqs

- Node.js 20+
- `pnpm`
- Docker Desktop

### Environment variables

Create the API env file:

```bash
cp apps/api/.env.example apps/api/.env
```

### Start everything

```bash
cd trawell
pnpm install
pnpm start
```

This will:

- Start Postgres+PostGIS and MinIO via Docker
- Run DB migrations
- Start the API and web app in dev mode

### URLs

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:4000`
- **MinIO console**: `http://localhost:9001` (default user/pass: `minioadmin` / `minioadmin`)

## Quick start: seed content and test geofencing

1. Open `http://localhost:3000/login` and **register**
2. Open `http://localhost:3000/creator`
3. Click **Enable creator mode**
4. Click **Seed local example** (creates a tiny WAV, uploads to MinIO, publishes geo-audio + a 1-stop tour)
5. Open `http://localhost:3000/listen`
6. Either:
   - Click **Share GPS location**, or
   - Use **Dev: location override** and paste the seed lat/lng from the creator page
7. Open the nearby audio item → **Request access & play**

## Docs

- See `[docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)` for troubleshooting and workflows
- See `[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)` for system design and data flows
- See `[docs/API.md](docs/API.md)` for endpoints and example requests

