import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

const LOCAL_STORE_FILE = path.join(process.cwd(), ".local-users-store.json");

declare global {
  // eslint-disable-next-line no-var
  var __beautyiq_users_store: Map<string, StoredUser> | undefined;
}

function getMemoryStore(): Map<string, StoredUser> {
  if (!globalThis.__beautyiq_users_store) {
    const store = new Map<string, StoredUser>();

    // Standard default demo accounts
    const DEFAULT_DEMO_HASH = bcrypt.hashSync("Password123!", 10);
    store.set("demo@gmail.com", {
      id: "user-demo-gmail",
      name: "BeautyIQ Demo",
      email: "demo@gmail.com",
      passwordHash: DEFAULT_DEMO_HASH,
      createdAt: new Date(),
    });

    store.set("customer@beautyiq.com", {
      id: "user-demo-customer",
      name: "Aanya Sharma",
      email: "customer@beautyiq.com",
      passwordHash: DEFAULT_DEMO_HASH,
      createdAt: new Date(),
    });

    // Load from local file if exists
    try {
      if (fs.existsSync(LOCAL_STORE_FILE)) {
        const content = fs.readFileSync(LOCAL_STORE_FILE, "utf-8");
        const list: StoredUser[] = JSON.parse(content);
        if (Array.isArray(list)) {
          for (const u of list) {
            if (u.email && u.passwordHash) {
              store.set(u.email.toLowerCase(), {
                ...u,
                createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn("[UserStore] Could not read local file store:", e);
    }

    globalThis.__beautyiq_users_store = store;
  }
  return globalThis.__beautyiq_users_store;
}

function persistStoreToFile(store: Map<string, StoredUser>) {
  try {
    const arr = Array.from(store.values());
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (e) {
    console.warn("[UserStore] Could not write local file store:", e);
  }
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Attempt Prisma database lookup
  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (dbUser) {
        return {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          passwordHash: dbUser.passwordHash,
          createdAt: dbUser.createdAt,
        };
      }
    } catch (dbErr) {
      console.warn("[UserStore] Prisma lookup failed, falling back to memory store:", dbErr);
    }
  }

  // 2. Global in-memory & file store fallback
  const store = getMemoryStore();
  const memUser = store.get(cleanEmail);
  if (memUser) return memUser;

  return null;
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<StoredUser> {
  const cleanEmail = data.email.trim().toLowerCase();

  // 1. Attempt Prisma creation if DB configured
  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await prisma.user.create({
        data: {
          name: data.name,
          email: cleanEmail,
          passwordHash: data.passwordHash,
        },
      });
      const created: StoredUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        passwordHash: dbUser.passwordHash,
        createdAt: dbUser.createdAt,
      };
      // Keep memory store synced
      const store = getMemoryStore();
      store.set(cleanEmail, created);
      persistStoreToFile(store);
      return created;
    } catch (dbErr: any) {
      if (dbErr?.code === "P2002") {
        throw dbErr; // Unique constraint violation
      }
      console.warn("[UserStore] Prisma create failed, saving to memory store:", dbErr);
    }
  }

  // 2. Local store check unique
  const store = getMemoryStore();
  if (store.has(cleanEmail)) {
    const error: any = new Error("Unique constraint violation");
    error.code = "P2002";
    throw error;
  }

  const fallbackUser: StoredUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name,
    email: cleanEmail,
    passwordHash: data.passwordHash,
    createdAt: new Date(),
  };

  store.set(cleanEmail, fallbackUser);
  persistStoreToFile(store);
  return fallbackUser;
}
