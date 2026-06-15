"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { trainers } from "@/db/schema";
import { getCurrentTrainer } from "@/lib/auth";
import type { Trainer } from "@/lib/types";

export async function updateTrainerAction(trainer: Trainer) {
  const db = getDb();
  const currentTrainer = await getCurrentTrainer();
  const rows = await db.update(trainers).set({
    name: trainer.name,
    logoUrl: trainer.logoUrl,
    photoUrl: trainer.photoUrl,
    instagram: trainer.instagram,
    whatsapp: trainer.whatsapp,
    brandPrimary: trainer.brandPrimary,
    brandSecondary: trainer.brandSecondary,
    motivationalPhrase: trainer.motivationalPhrase,
    reportSignature: trainer.reportSignature,
    onboardingCompleted: trainer.onboardingCompleted,
  }).where(eq(trainers.id, currentTrainer.id)).returning();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard/relatorios");

  return rows[0] ?? null;
}
