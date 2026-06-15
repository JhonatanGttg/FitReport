"use server";

import { getDb } from "@/db/client";
import { trainers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function provisionTrainerProfileAction({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name: string;
}) {
  const db = getDb();
  const trainerName = name.trim() || email.split("@")[0] || "Personal Trainer";

  await db.insert(users).values({
    id: userId,
    email,
    name: trainerName,
  }).onConflictDoUpdate({
    target: users.id,
    set: {
      email,
      name: trainerName,
    },
  });

  const existingTrainer = await db.select({ id: trainers.id }).from(trainers).where(eq(trainers.userId, userId)).limit(1);
  if (existingTrainer[0]) return;

  await db.insert(trainers).values({
    userId,
    name: trainerName,
    instagram: "",
    whatsapp: "",
    brandPrimary: "#2563eb",
    brandSecondary: "#020617",
    motivationalPhrase: "Evolucao mensuravel, treino inteligente.",
    reportSignature: `${trainerName} - Personal Trainer`,
  });
}
