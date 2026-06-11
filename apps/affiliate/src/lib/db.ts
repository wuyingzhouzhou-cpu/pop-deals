import "server-only"
import { Pool, type QueryResultRow } from "pg"

let pool: Pool | null = null

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured")
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
    })
  }

  return pool
}

export async function query<T extends QueryResultRow>(
  sql: string,
  values: unknown[] = []
) {
  const result = await getPool().query<T>(sql, values)
  return result.rows
}
