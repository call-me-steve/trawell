# API

Base URL (local): `http://localhost:4000`

Auth is via:

- **Access token**: `Authorization: Bearer <token>` (stored client-side in this MVP)
- **Refresh cookie**: `refresh_token` (HTTP-only cookie)

## Auth

### `POST /auth/register`

Body:

```json
{ "email": "you@example.com", "password": "password123" }
```

Returns:

- `user`
- `accessToken`

### `POST /auth/login`

Body:

```json
{ "email": "you@example.com", "password": "password123" }
```

### `POST /auth/logout`

Clears refresh cookie.

### `GET /auth/me`

Returns `user` (and may return a new `accessToken` if you have only a refresh cookie).

## Creator

All creator endpoints require `role=creator` (set via `/creator/profile/become` in MVP).

### `POST /creator/profile/become`

Promotes the current user to creator (MVP convenience).

### `POST /creator/geofences`

Body:

```json
{
  "name": "EiffelTower",
  "center": { "lat": 48.85837, "lng": 2.29448 },
  "radiusM": 10
}
```

Default `radiusM` is 10. Min 1, max 50_000.

### `POST /creator/audio/init-upload`

Body:

```json
{
  "title": "MyAudio",
  "description": "Optional",
  "mimeType": "audio/mpeg",
  "sizeBytes": 123456
}
```

Returns:

- `audioAsset`
- `uploadUrl` (pre-signed PUT)

### `POST /creator/geo-audio`

Attach an audio asset to a geofence.

```json
{
  "audioAssetId": "uuid",
  "geofenceId": "uuid",
  "visibility": "public"
}
```

### `POST /creator/tours`

```json
{ "title": "MyTour", "description": "Optional" }
```

### `POST /creator/tours/:id/stops`

```json
{ "geoAudioId": "uuid", "sortOrder": 0 }
```

### `POST /creator/publish/:entity/:id`

Entities:

- `geo-audio`
- `tour`

## Listener

### `GET /map-items?lat=..&lng=..&radius=..`

Returns published geo-audio whose geofence center is within `radius` of the point (for map markers). Default `radius` 5000. Includes: `geo_audio_id`, `title`, `description`, `radius_m`, `lat`, `lng`, `author`.

### `GET /geo-audio/:id`

Returns metadata for a single geo-audio (title, description, author, radius, lat, lng). No auth. 404 if not public/unlisted or not published.

### `GET /nearby?lat=..&lng=..&radius=..`

Returns public geo-audio whose geofence **contains** the user (i.e. user is inside). Use for "playable" list.

### `POST /geo-audio/:id/access`

Body:

```json
{ "lat": 48.85837, "lng": 2.29448 }
```

If inside the geofence, returns:

- `streamUrl` (pre-signed GET)

### `GET /tours/:id`

Returns tour metadata + ordered stops.

## Dev-only

All dev endpoints are available only when `NODE_ENV=development`.

### `POST /dev/seed-test-accounts`

Creates test users: `creator@test.com`/creator123, `listener@test.com`/listener123. No auth. Idempotent.

### `POST /creator/dev/seed-example`

Body:

```json
{ "lat": 48.85837, "lng": 2.29448 }
```

Requires creator auth. Creates a 2s WAV, geofence (10m), geo-audio, and 1-stop tour at the given location.

### `POST /creator/dev/sample-audio`

Requires creator auth. Creates a 2s tone audio asset (no geofence). Returns `audioId` for use in attach flow.

