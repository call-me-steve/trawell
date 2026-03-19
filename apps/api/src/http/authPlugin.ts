import type { FastifyPluginAsync } from "fastify";
import { verifyAccessToken } from "../auth/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: "listener" | "creator";
    };
  }
}

export const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorateRequest("user", null);

  app.addHook("preHandler", async (req) => {
    const header = req.headers.authorization;
    if (!header) return;
    const [, token] = header.split(" ");
    if (!token) return;
    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    } catch {
      // ignore invalid tokens; handlers can requireAuth() explicitly
    }
  });
};

export function requireAuth(req: { user?: unknown }): asserts req is { user: { id: string; email: string; role: "listener" | "creator" } } {
  if (!req.user) {
    const err = new Error("Unauthorized");
    (err as any).statusCode = 401;
    throw err;
  }
}

export function requireCreator(req: { user?: { role: string } }): void {
  requireAuth(req);
  if (req.user.role !== "creator") {
    const err = new Error("Forbidden");
    (err as any).statusCode = 403;
    throw err;
  }
}

