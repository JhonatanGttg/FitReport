import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL);
  const supabaseKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  const databaseUrl = Boolean(process.env.DATABASE_URL);

  const result = {
    ok: false,
    env: {
      DATABASE_URL: databaseUrl,
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
      SUPABASE_PUBLIC_KEY: supabaseKey,
      NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
    database: {
      connected: false,
      message: "",
    },
  };

  if (!databaseUrl) {
    result.database.message = "DATABASE_URL ausente.";
    return Response.json(result, { status: 503 });
  }

  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    result.database.connected = true;
    result.database.message = "Postgres conectado.";
    result.ok = supabaseUrl && supabaseKey;
    return Response.json(result, { status: result.ok ? 200 : 503 });
  } catch (error) {
    result.database.message = error instanceof Error ? sanitizeError(error.message) : "Falha desconhecida no Postgres.";
    return Response.json(result, { status: 503 });
  }
}

function sanitizeError(message: string) {
  return message.replace(/postgresql:\/\/[^@]+@/g, "postgresql://***@");
}
