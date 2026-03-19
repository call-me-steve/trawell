import type { z } from "zod";
import type {
  AddTourStopSchema,
  AttachGeoAudioSchema,
  CreateGeofenceSchema,
  CreateTourSchema,
  InitAudioUploadSchema,
  LocationSchema,
  LoginSchema,
  RegisterSchema,
} from "./schemas.js";

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type LocationInput = z.infer<typeof LocationSchema>;
export type CreateGeofenceInput = z.infer<typeof CreateGeofenceSchema>;
export type InitAudioUploadInput = z.infer<typeof InitAudioUploadSchema>;
export type AttachGeoAudioInput = z.infer<typeof AttachGeoAudioSchema>;
export type CreateTourInput = z.infer<typeof CreateTourSchema>;
export type AddTourStopInput = z.infer<typeof AddTourStopSchema>;

