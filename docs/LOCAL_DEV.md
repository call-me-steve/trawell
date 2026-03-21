# Local development

## Start

```bash
pnpm install
docker compose up -d
pnpm db:migrate
pnpm dev
```

Or the one-liner:

```bash
pnpm start
```

## Configure environment

**API** reads from `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

**Web** (optional): create `apps/web/.env.local` for Google Maps:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

Get a key at [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials). Enable "Maps JavaScript API". Without it, the map shows a fallback message but lat/lng inputs still work.

## Services

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:4000`
- **DB**: `localhost:5432` (`trawell` / `trawell`, db `trawell`)
- **MinIO**: `http://localhost:9000` (S3 endpoint)
- **MinIO console**: `http://localhost:9001` (default `minioadmin` / `minioadmin`)

## Test accounts (dev only)

On the login page, click **Seed test accounts** to create:

| Email | Password | Use |
|-------|----------|-----|
| creator@test.com | creator123 | Creator mode |
| listener@test.com | listener123 | Listener mode |

Use the **Creator | Listener** toggle on the login page to choose which view to enter after login. You can switch modes anytime via the nav.

## Seed demo content

The Creator UI has **Seed example** which creates:

- A 2s tone, geofence at your location (10m radius), published geo-audio + tour

Flow:

1. Log in as creator@test.com
2. `http://localhost:3000/creator` → Enable creator mode → **Seed example**
3. `http://localhost:3000/listen` → Log in as listener@test.com → Share GPS or use Dev override → tap map marker → Open → Check & play

## Common problems

### Docker daemon not running

If you see:

- `Cannot connect to the Docker daemon ... docker.sock`

Start **Docker Desktop**, then re-run:

```bash
docker compose up -d
```

### MinIO bucket doesn’t exist

The `minio-init` container creates the `trawell-audio` bucket automatically. If you removed volumes or changed names:

```bash
docker compose up -d --force-recreate
```

### Port conflicts

Default ports:

- Web: 3000
- API: 4000
- Postgres: 5432
- MinIO: 9000/9001

If any are already in use, stop the conflicting service or change `docker-compose.yml` / `apps/api/.env`.

