import "server-only"
import { hasDatabase } from "../db"

export function normalizeHost(host: string | null) {
  return (host || "localhost").split(":")[0].toLowerCase()
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function assertDatabase() {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL is not configured")
  }
}
