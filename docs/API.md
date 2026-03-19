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
  "radiusM": 150
}
```

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

### `GET /nearby?lat=..&lng=..&radius=..`

Returns public geo-audio within `radius` meters of the requested point.

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

### `POST /creator/dev/seed-example`

Only available when `NODE_ENV=development`.

Body:

```json
{ "lat": 48.85837, "lng": 2.29448 }
```

Creates a tiny WAV in MinIO + inserts a geofence, geo-audio, and tour for fast local testing.

