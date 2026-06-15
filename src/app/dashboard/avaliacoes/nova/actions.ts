"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import { assessments, bodyMeasurements, skinfolds, students } from "@/db/schema";
import { getCurrentTrainer } from "@/lib/auth";
import { calculateBmi, calculateComposition } from "@/lib/calculations";
import { assessmentSchema } from "@/lib/validations";

export async function saveAssessmentAction(input: unknown) {
  const parsed = assessmentSchema.parse(input);
  const db = getDb();
  const trainer = await getCurrentTrainer();

  const student = await db.select({ id: students.id }).from(students).where(
    and(eq(students.id, parsed.studentId), eq(students.trainerId, trainer.id)),
  ).limit(1);
  if (!student[0]) throw new Error("Aluno nao encontrado para este personal.");

  const bmi = calculateBmi(parsed.weight, parsed.height);
  const composition = calculateComposition(parsed.weight, parsed.bodyFat);

  const inserted = await db.insert(assessments).values({
    trainerId: trainer.id,
    studentId: parsed.studentId,
    date: parsed.date,
    weight: parsed.weight,
    height: parsed.height,
    bmi,
    bodyFat: parsed.bodyFat,
    leanMass: composition.leanMass,
    fatMass: composition.fatMass,
  }).returning({ id: assessments.id });

  const assessmentId = inserted[0].id;

  await db.insert(bodyMeasurements).values({
    assessmentId,
    ...parsed.measurements,
  });

  await db.insert(skinfolds).values({
    assessmentId,
    ...parsed.skinfolds,
  });

  const previous = await db.select({ id: assessments.id }).from(assessments).where(
    and(
      eq(assessments.trainerId, trainer.id),
      eq(assessments.studentId, parsed.studentId),
      ne(assessments.id, assessmentId),
    ),
  ).orderBy(desc(assessments.date), desc(assessments.createdAt)).limit(1);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/alunos");
  revalidatePath(`/dashboard/alunos/${parsed.studentId}`);
  revalidatePath("/dashboard/relatorios");

  return {
    assessmentId,
    studentId: parsed.studentId,
    previousAssessmentId: previous[0]?.id ?? null,
  };
}
