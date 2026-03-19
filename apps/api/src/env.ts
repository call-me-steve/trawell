import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_REFRESH_SECRET: z.string().min(20),
  JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().min(60).max(60 * 60 * 24).default(60 * 15),
  JWT_REFRESH_TTL_SECONDS: z.coerce
    .number()
    .int()
    .min(60 * 60)
    .max(60 * 60 * 24 * 30)
    .default(60 * 60 * 24 * 7),

  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),

  S3_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1).default("trawell-audio"),

  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(30).max(60 * 30).default(120)
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_TTL_SECONDS: process.env.JWT_ACCESS_TTL_SECONDS,
  JWT_REFRESH_TTL_SECONDS: process.env.JWT_REFRESH_TTL_SECONDS,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
  SIGNED_URL_TTL_SECONDS: process.env.SIGNED_URL_TTL_SECONDS
});

