import type { FastifyPluginAsync } from "fastify";
import { RegisterSchema, LoginSchema } from "@trawell/shared";
import { pool } from "../db/pool.js";
import { hashPassword, verifyPassword } from "../auth/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../auth/jwt.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/register",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (req, reply) => {
      const input = RegisterSchema.parse(req.body);
      const passwordHash = await hashPassword(input.password);

      const res = await pool.query(
        `insert into users(email, password_hash, role)
         values ($1,$2,'listener')
         returning id, email, role, created_at`,
        [input.email.toLowerCase(), passwordHash]
      );

      const user = res.rows[0];
      const access = signAccessToken({ sub: user.id, email: user.email, role: user.role });
      const refresh = signRefreshToken({ sub: user.id });

      reply
        .setCookie("refresh_token", refresh, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: false,
          maxAge: 60 * 60 * 24 * 7,
        })
        .send({ user, accessToken: access });
    }
  );

  app.post(
    "/login",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    },
    async (req, reply) => {
      const input = LoginSchema.parse(req.body);
      const res = await pool.query(`select id, email, password_hash, role, created_at from users where email=$1`, [
        input.email.toLowerCase(),
      ]);
      const user = res.rows[0];
      if (!user) return reply.status(401).send({ error: "Invalid credentials" });

      const ok = await verifyPassword(input.password, user.password_hash);
      if (!ok) return reply.status(401).send({ error: "Invalid credentials" });

      const access = signAccessToken({ sub: user.id, email: user.email, role: user.role });
      const refresh = signRefreshToken({ sub: user.id });

      return reply
        .setCookie("refresh_token", refresh, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: false,
          maxAge: 60 * 60 * 24 * 7,
        })
        .send({
          user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at },
          accessToken: access,
        });
    }
  );

  app.post("/logout", async (_req, reply) => {
    return reply
      .clearCookie("refresh_token", { path: "/" })
      .send({ ok: true });
  });

  app.get("/me", async (req, reply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // try refresh flow
      const token = req.cookies["refresh_token"];
      if (!token) return reply.status(401).send({ error: "Unauthorized" });
      let sub: string;
      try {
        sub = verifyRefreshToken(token).sub;
      } catch {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      const res = await pool.query(`select id, email, role, created_at from users where id=$1`, [sub]);
      const user = res.rows[0];
      if (!user) return reply.status(401).send({ error: "Unauthorized" });
      const access = signAccessToken({ sub: user.id, email: user.email, role: user.role });
      return reply.send({ user, accessToken: access });
    }

    if (!req.user) return reply.status(401).send({ error: "Unauthorized" });
    const res = await pool.query(`select id, email, role, created_at from users where id=$1`, [req.user.id]);
    const user = res.rows[0];
    if (!user) return reply.status(401).send({ error: "Unauthorized" });
    return reply.send({ user });
  });
};

