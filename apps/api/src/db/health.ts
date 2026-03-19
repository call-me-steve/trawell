import { pool } from "./pool.js";

export async function dbHealth() {
  const res = await pool.query("select 1 as ok");
  return res.rows[0]?.ok === 1;
}

