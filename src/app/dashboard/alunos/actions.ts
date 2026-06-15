"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { students } from "@/db/schema";
import { getCurrentTrainer } from "@/lib/auth";
import type { Sex, Student } from "@/lib/types";

export async function saveStudentAction(formData: FormData): Promise<Student | null> {
  const db = getDb();
  const trainer = await getCurrentTrainer();

  const id = String(formData.get("id") ?? "");
  const payload = {
    trainerId: trainer.id,
    name: String(formData.get("name") ?? ""),
    sex: String(formData.get("sex") ?? "Outro"),
    age: Number(formData.get("age") ?? 0),
    birthDate: String(formData.get("birthDate") ?? ""),
    height: Number(formData.get("height") ?? 0),
    initialWeight: Number(formData.get("initialWeight") ?? 0),
    photoUrl: String(formData.get("photoUrl") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const rows = id
    ? await updateOwnedStudent(db, id, trainer.id, payload)
    : await db.insert(students).values(payload).returning();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alunos");
  revalidatePath("/dashboard/relatorios");

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    trainerId: row.trainerId,
    name: row.name,
    sex: row.sex as Sex,
    age: row.age,
    birthDate: row.birthDate,
    height: row.height,
    initialWeight: row.initialWeight,
    photoUrl: row.photoUrl,
    notes: row.notes,
  };
}

async function updateOwnedStudent(
  db: ReturnType<typeof getDb>,
  id: string,
  trainerId: string,
  payload: typeof students.$inferInsert,
) {
  const existing = await db.select({ trainerId: students.trainerId }).from(students).where(eq(students.id, id)).limit(1);
  if (existing[0]?.trainerId !== trainerId) return [];
  return db.update(students).set(payload).where(eq(students.id, id)).returning();
}

export async function deleteStudentAction(id: string) {
  const db = getDb();
  const trainer = await getCurrentTrainer();
  const existing = await db.select({ trainerId: students.trainerId }).from(students).where(eq(students.id, id)).limit(1);
  if (existing[0]?.trainerId !== trainer.id) return;

  await db.delete(students).where(eq(students.id, id));
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alunos");
  revalidatePath("/dashboard/relatorios");
}
