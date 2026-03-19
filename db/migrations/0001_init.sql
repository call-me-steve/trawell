create extension if not exists "uuid-ossp";
create extension if not exists postgis;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'listener' check (role in ('listener','creator')),
  created_at timestamptz not null default now()
);

create table if not exists creator_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  display_name text,
  payout_status text
);

create table if not exists audio_assets (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  duration_sec int,
  mime_type text not null,
  storage_bucket text not null,
  storage_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists geofences (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references users(id) on delete cascade,
  name text,
  center_geog geography(Point,4326) not null,
  radius_m int not null check (radius_m > 0),
  created_at timestamptz not null default now()
);

create index if not exists geofences_center_gix on geofences using gist (center_geog);

create table if not exists geo_audio (
  id uuid primary key default uuid_generate_v4(),
  audio_asset_id uuid not null references audio_assets(id) on delete cascade,
  geofence_id uuid not null references geofences(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(audio_asset_id, geofence_id)
);

create table if not exists tours (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  cover_image_key text,
  is_paid bool not null default false,
  price_cents int,
  currency text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists tour_stops (
  id uuid primary key default uuid_generate_v4(),
  tour_id uuid not null references tours(id) on delete cascade,
  geo_audio_id uuid not null references geo_audio(id) on delete restrict,
  sort_order int not null default 0,
  stop_title text,
  stop_notes text,
  created_at timestamptz not null default now(),
  unique(tour_id, geo_audio_id)
);

create index if not exists tour_stops_tour_id_sort on tour_stops(tour_id, sort_order);

create table if not exists purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  tour_id uuid not null references tours(id) on delete cascade,
  provider text,
  provider_ref text,
  status text,
  created_at timestamptz not null default now(),
  unique(user_id, tour_id)
);

