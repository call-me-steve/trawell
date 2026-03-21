import { z } from "zod";

export const LatSchema = z.number().min(-90).max(90);
export const LngSchema = z.number().min(-180).max(180);

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
});

export const LocationSchema = z.object({
  lat: LatSchema,
  lng: LngSchema,
});

export const CreateGeofenceSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  center: LocationSchema,
  radiusM: z.number().int().min(1).max(50_000).default(10),
});

export const InitAudioUploadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  mimeType: z.string().min(3).max(200),
  sizeBytes: z.number().int().min(1).max(250 * 1024 * 1024),
});

export const AttachGeoAudioSchema = z.object({
  audioAssetId: z.string().uuid(),
  geofenceId: z.string().uuid(),
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
});

export const CreateTourSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
});

export const AddTourStopSchema = z.object({
  geoAudioId: z.string().uuid(),
  sortOrder: z.number().int().min(0).max(10000),
  stopTitle: z.string().min(1).max(200).optional(),
  stopNotes: z.string().max(5000).optional(),
});

