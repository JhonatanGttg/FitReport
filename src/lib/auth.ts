import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import type { User } from "@supabase/supabase-js";
import { getDb } from "@/db/client";
import { trainers, users } from "@/db/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  return user;
}

export async function getCurrentTrainer() {
  const user = await requireAuthenticatedUser();
  return getOrCreateTrainerForUser(user);
}

export async function getOptionalCurrentTrainer() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  return getOrCreateTrainerForUser(user);
}

async function getOrCreateTrainerForUser(user: User) {
  const db = getDb();
  const email = user.email ?? "";
  const fallbackName = user.user_metadata?.name || user.user_metadata?.full_name || email.split("@")[0] || "Personal Trainer";

  await db.insert(users).values({
    id: user.id,
    email,
    name: fallbackName,
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      email,
      name: fallbackName,
    },
  });

  const existing = await db.select().from(trainers).where(eq(trainers.userId, user.id)).limit(1);
  if (existing[0]) return existing[0];

  const created = await db.insert(trainers).values({
    userId: user.id,
    name: fallbackName,
    instagram: "",
    whatsapp: "",
    brandPrimary: "#2563eb",
    brandSecondary: "#020617",
    motivationalPhrase: "Evolucao mensuravel, treino inteligente.",
    reportSignature: `${fallbackName} - Personal Trainer`,
  }).returning();

  return created[0];
}
