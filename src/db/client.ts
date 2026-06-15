import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  if (!db) {
    const client = postgres(process.env.DATABASE_URL, { prepare: false });
    db = drizzle(client, { schema });
  }

  return db;
}
