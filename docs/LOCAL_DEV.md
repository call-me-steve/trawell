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

API reads env from `apps/api/.env`.

```bash
cp apps/api/.env.example apps/api/.env
```

## Services

- **Web**: `http://localhost:3000`
- **API**: `http://localhost:4000`
- **DB**: `localhost:5432` (`trawell` / `trawell`, db `trawell`)
- **MinIO**: `http://localhost:9000` (S3 endpoint)
- **MinIO console**: `http://localhost:9001` (default `minioadmin` / `minioadmin`)

## Seed demo content (recommended)

The Creator UI has a button that seeds everything you need to test as a Listener:

- Generates a small `audio/wav` file in memory
- Uploads it to MinIO
- Creates a geofence near your location
- Creates a published geo-audio
- Creates a published one-stop tour

Flow:

1. `http://localhost:3000/login` → register
2. `http://localhost:3000/creator` → Enable creator mode
3. Click **Seed local example**
4. `http://localhost:3000/listen` → Share GPS or set Dev override → play

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

