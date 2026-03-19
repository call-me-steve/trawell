import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";
import { env } from "./env.js";
import { authPlugin } from "./http/authPlugin.js";
import { authRoutes } from "./routes/auth.js";
import { creatorRoutes } from "./routes/creator.js";
import { listenerRoutes } from "./routes/listener.js";
import { dbHealth } from "./db/health.js";

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
});

await app.register(cookie, {
  hook: "onRequest",
});

await app.register(rateLimit, {
  global: true,
  max: 200,
  timeWindow: "1 minute",
});

await app.register(authPlugin);

app.get("/health", async () => ({ ok: true, db: await dbHealth() }));

await app.register(authRoutes, { prefix: "/auth" });
await app.register(creatorRoutes, { prefix: "/creator" });
await app.register(listenerRoutes);

app.setErrorHandler(async (err, req, reply) => {
  const statusCode = (err as any).statusCode ?? 500;
  if (statusCode >= 500) req.log.error(err);
  return reply.status(statusCode).send({ error: err.message ?? "Internal Server Error" });
});

await app.listen({ port: env.PORT, host: "0.0.0.0" });

