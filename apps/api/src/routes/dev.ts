import type { FastifyPluginAsync } from "fastify";
import { pool } from "../db/pool.js";
import { hashPassword } from "../auth/password.js";
import { env } from "../env.js";

const CREATOR_EMAIL = "creator@test.com";
const CREATOR_PASS = "creator123";
const LISTENER_EMAIL = "listener@test.com";
const LISTENER_PASS = "listener123";

export const devRoutes: FastifyPluginAsync = async (app) => {
  app.post("/seed-test-accounts", async (req, reply) => {
    if (env.NODE_ENV !== "development") {
      return reply.status(404).send({ error: "Not available" });
    }
    const creatorHash = await hashPassword(CREATOR_PASS);
    const listenerHash = await hashPassword(LISTENER_PASS);

    await pool.query(
      `insert into users(email, password_hash, role) values ($1,$2,'creator')
       on conflict (email) do update set password_hash=excluded.password_hash, role='creator'`,
      [CREATOR_EMAIL, creatorHash]
    );
    await pool.query(
      `insert into users(email, password_hash, role) values ($1,$2,'listener')
       on conflict (email) do update set password_hash=excluded.password_hash, role='listener'`,
      [LISTENER_EMAIL, listenerHash]
    );

    // Ensure creator has profile
    const c = await pool.query(`select id from users where email=$1`, [CREATOR_EMAIL]);
    if (c.rows[0]) {
      await pool.query(`insert into creator_profiles(user_id) values($1) on conflict (user_id) do nothing`, [c.rows[0].id]);
    }

    return {
      ok: true,
      accounts: [
        { email: CREATOR_EMAIL, password: CREATOR_PASS, role: "creator" },
        { email: LISTENER_EMAIL, password: LISTENER_PASS, role: "listener" },
      ],
    };
  });
};
