import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// 1. Ensure Data Directory Exists
// Guard: skip during Next.js build (no filesystem writes needed at build time)
const dbDir = path.join(process.cwd(), "data");
if (typeof window === "undefined" && process.env.NEXT_PHASE !== "phase-production-build") {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

export const dbPath = path.join(dbDir, "beautyiq.db");

// 2. Initialize Database Connection (Singleton for Next.js)
declare global {
  // eslint-disable-next-line no-var
  var __beautyiq_db: Database.Database | undefined;
}

export function getDatabase(): Database.Database {
  if (process.env.NODE_ENV === "production") {
    const conn = new Database(dbPath, { timeout: 5000 });
    conn.pragma("journal_mode = WAL");
    conn.pragma("foreign_keys = ON");
    conn.pragma("busy_timeout = 5000");
    return conn;
  }
  if (!global.__beautyiq_db) {
    global.__beautyiq_db = new Database(dbPath, { timeout: 5000 });
    global.__beautyiq_db.pragma("journal_mode = WAL");
    global.__beautyiq_db.pragma("foreign_keys = ON");
    global.__beautyiq_db.pragma("busy_timeout = 5000");
  }
  return global.__beautyiq_db;
}

/**
 * Lazy database singleton.
 * Accessing any property on `db` triggers the connection the first time —
 * which only happens inside a request handler, never at module import time
 * (i.e., never during the Next.js build phase).
 */
export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_target, prop) {
    return getDatabase()[prop as keyof Database.Database];
  },
  set(_target, prop, value) {
    (getDatabase() as unknown as Record<string, unknown>)[prop as string] = value;
    return true;
  },
});
