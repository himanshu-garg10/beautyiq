import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

// 1. Ensure Data Directory Exists
const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const dbPath = path.join(dbDir, "beautyiq.db");

// 2. Initialize Database Connection (Singleton for Next.js)
declare global {
  // eslint-disable-next-line no-var
  var __beautyiq_db: Database.Database | undefined;
}

export function getDatabase(): Database.Database {
  if (process.env.NODE_ENV === "production") {
    const db = new Database(dbPath, { timeout: 5000 });
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    return db;
  }
  if (!global.__beautyiq_db) {
    global.__beautyiq_db = new Database(dbPath, { timeout: 5000 });
    global.__beautyiq_db.pragma("journal_mode = WAL");
    global.__beautyiq_db.pragma("foreign_keys = ON");
    global.__beautyiq_db.pragma("busy_timeout = 5000");
  }
  return global.__beautyiq_db;
}

export const db = getDatabase();
