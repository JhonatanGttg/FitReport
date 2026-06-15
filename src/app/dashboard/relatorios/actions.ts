"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { assessments, reports, students } from "@/db/schema";
import { getCurrentTrainer } from "@/lib/auth";
import { reportSaveSchema } from "@/lib/validations";

export async function saveReportAction(input: unknown) {
  const parsed = reportSaveSchema.parse(input);
  const db = getDb();
  const trainer = await getCurrentTrainer();

  const [student, first, second] = await Promise.all([
    db.select({ id: students.id }).from(students).where(
      and(eq(students.id, parsed.studentId), eq(students.trainerId, trainer.id)),
    ).limit(1),
    db.select({ id: assessments.id }).from(assessments).where(
      and(eq(assessments.id, parsed.firstAssessmentId), eq(assessments.trainerId, trainer.id), eq(assessments.studentId, parsed.studentId)),
    ).limit(1),
    db.select({ id: assessments.id }).from(assessments).where(
      and(eq(assessments.id, parsed.secondAssessmentId), eq(assessments.trainerId, trainer.id), eq(assessments.studentId, parsed.studentId)),
    ).limit(1),
  ]);

  if (!student[0] || !first[0] || !second[0]) {
    throw new Error("Nao foi possivel validar este relatorio para o personal atual.");
  }

  const publicToken = parsed.publicEnabled ? randomUUID() : "";
  const publicExpiresAt = parsed.publicEnabled ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) : null;

  const [saved] = await db.insert(reports).values({
    trainerId: trainer.id,
    studentId: parsed.studentId,
    firstAssessmentId: parsed.firstAssessmentId,
    secondAssessmentId: parsed.secondAssessmentId,
    template: parsed.template,
    professionalAnalysis: parsed.professionalAnalysis,
    improved: JSON.stringify(parsed.improved),
    worsened: JSON.stringify(parsed.worsened),
    needs: JSON.stringify(parsed.needs),
    recommendations: JSON.stringify(parsed.recommendations),
    publicEnabled: parsed.publicEnabled,
    publicToken,
    publicExpiresAt,
  }).returning({ id: reports.id, publicToken: reports.publicToken });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/relatorios");
  revalidatePath(`/dashboard/alunos/${parsed.studentId}`);

  return saved;
}
