import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env.js";
import { s3 } from "./client.js";

export async function presignPutObject(params: { key: string; contentType: string }) {
  const cmd = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.key,
    ContentType: params.contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: env.SIGNED_URL_TTL_SECONDS });
  return { url, bucket: env.S3_BUCKET, key: params.key };
}

export async function presignGetObject(params: { key: string }) {
  const cmd = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: params.key,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: env.SIGNED_URL_TTL_SECONDS });
  return { url };
}

