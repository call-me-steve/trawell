import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.resolve(__dirname, "../../../../db/migrations");

async function ensureMigrationsTable() {
  await pool.query(`
    create table if not exists migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function main() {
  await ensureMigrationsTable();

  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const id = file;
    const res = await pool.query("select 1 from migrations where id = $1", [id]);
    if (res.rowCount && res.rowCount > 0) continue;

    const sqlPath = path.join(migrationsDir, file);
    const sql = await fs.readFile(sqlPath, "utf8");
    process.stdout.write(`Applying migration ${file}... `);
    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query("insert into migrations(id) values($1)", [id]);
      await pool.query("commit");
      process.stdout.write("OK\n");
    } catch (err) {
      await pool.query("rollback");
      process.stdout.write("FAILED\n");
      throw err;
    }
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

