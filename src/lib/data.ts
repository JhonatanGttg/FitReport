import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { assessments, bodyMeasurements, reports, skinfolds, students, trainers } from "@/db/schema";
import { getOptionalCurrentTrainer } from "@/lib/auth";
import { demoData } from "@/lib/demo-data";
import type { AppData, Assessment, Measurements, Report, Skinfolds, Student, Trainer } from "@/lib/types";

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getAppData(): Promise<AppData> {
  if (!canUseDatabase()) return demoData;

  try {
    const db = getDb();
    const trainer = await getOptionalCurrentTrainer();
    if (!trainer) return demoData;

    const [studentRows, assessmentRows, reportRows] = await Promise.all([
      db.select().from(students).where(eq(students.trainerId, trainer.id)).orderBy(asc(students.name)),
      db.select().from(assessments).where(eq(assessments.trainerId, trainer.id)).orderBy(asc(assessments.date)),
      db.select().from(reports).where(eq(reports.trainerId, trainer.id)).orderBy(asc(reports.createdAt)),
    ]);

    const assessmentIds = assessmentRows.map((item) => item.id);
    const [measurementRows, skinfoldRows] = assessmentIds.length
      ? await Promise.all([
          db.select().from(bodyMeasurements).where(inArray(bodyMeasurements.assessmentId, assessmentIds)),
          db.select().from(skinfolds).where(inArray(skinfolds.assessmentId, assessmentIds)),
        ])
      : [[], []];

    return {
      trainer: mapTrainer(trainer),
      students: studentRows.map(mapStudent),
      assessments: assessmentRows.map((assessment) => {
        const measurement = measurementRows.find((item) => item.assessmentId === assessment.id);
        const fold = skinfoldRows.find((item) => item.assessmentId === assessment.id);
        return mapAssessment(assessment, measurement, fold);
      }),
      reports: reportRows.map(mapReport),
    };
  } catch (error) {
    console.error("Falha ao carregar dados reais. Usando demo.", error);
    return demoData;
  }
}

export async function getStudentHistoryData(studentId: string) {
  const data = await getAppData();
  const student = data.students.find((item) => item.id === studentId);
  if (!student) return null;

  return {
    student,
    assessments: data.assessments.filter((item) => item.studentId === student.id),
  };
}

export async function getComparisonData({
  reportId,
  studentId,
  firstId,
  secondId,
}: {
  reportId?: string;
  studentId?: string;
  firstId?: string;
  secondId?: string;
}) {
  const data = await getAppData();

  if (studentId && firstId && secondId) {
    const student = data.students.find((item) => item.id === studentId);
    const first = data.assessments.find((item) => item.id === firstId && item.studentId === studentId);
    const second = data.assessments.find((item) => item.id === secondId && item.studentId === studentId);
    if (!student || !first || !second) return null;
    return { trainer: data.trainer, student, first, second };
  }

  const report = data.reports.find((item) => item.id === reportId);
  if (!report) return null;

  const student = data.students.find((item) => item.id === report.studentId);
  const first = data.assessments.find((item) => item.id === report.firstAssessmentId);
  const second = data.assessments.find((item) => item.id === report.secondAssessmentId);
  if (!student || !first || !second) return null;

  return { trainer: data.trainer, student, first, second };
}

function mapTrainer(row: typeof trainers.$inferSelect): Trainer {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    logoUrl: row.logoUrl,
    photoUrl: row.photoUrl,
    instagram: row.instagram,
    whatsapp: row.whatsapp,
    brandPrimary: row.brandPrimary,
    brandSecondary: row.brandSecondary,
    motivationalPhrase: row.motivationalPhrase,
    reportSignature: row.reportSignature,
  };
}

function mapStudent(row: typeof students.$inferSelect): Student {
  return {
    id: row.id,
    trainerId: row.trainerId,
    name: row.name,
    sex: row.sex as Student["sex"],
    age: row.age,
    birthDate: row.birthDate,
    height: row.height,
    initialWeight: row.initialWeight,
    photoUrl: row.photoUrl,
    notes: row.notes,
  };
}

function mapAssessment(
  row: typeof assessments.$inferSelect,
  measurement?: typeof bodyMeasurements.$inferSelect,
  fold?: typeof skinfolds.$inferSelect,
): Assessment {
  return {
    id: row.id,
    studentId: row.studentId,
    trainerId: row.trainerId,
    date: row.date,
    weight: row.weight,
    height: row.height,
    bmi: row.bmi,
    bodyFat: row.bodyFat,
    leanMass: row.leanMass,
    fatMass: row.fatMass,
    measurements: measurement ? mapMeasurements(measurement) : emptyMeasurements(),
    skinfolds: fold ? mapSkinfolds(fold) : emptySkinfolds(),
  };
}

function mapReport(row: typeof reports.$inferSelect): Report {
  return {
    id: row.id,
    trainerId: row.trainerId,
    studentId: row.studentId,
    firstAssessmentId: row.firstAssessmentId,
    secondAssessmentId: row.secondAssessmentId,
    professionalAnalysis: row.professionalAnalysis,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapMeasurements(row: typeof bodyMeasurements.$inferSelect): Measurements {
  return {
    shoulder: row.shoulder,
    leftArm: row.leftArm,
    rightArm: row.rightArm,
    waist: row.waist,
    abdomen: row.abdomen,
    hip: row.hip,
    leftThigh: row.leftThigh,
    rightThigh: row.rightThigh,
    leftLeg: row.leftLeg,
    rightLeg: row.rightLeg,
  };
}

function mapSkinfolds(row: typeof skinfolds.$inferSelect): Skinfolds {
  return {
    triceps: row.triceps,
    subscapular: row.subscapular,
    chest: row.chest,
    midaxillary: row.midaxillary,
    suprailiac: row.suprailiac,
    abdominal: row.abdominal,
    thigh: row.thigh,
  };
}

function emptyMeasurements(): Measurements {
  return {
    shoulder: 0,
    leftArm: 0,
    rightArm: 0,
    waist: 0,
    abdomen: 0,
    hip: 0,
    leftThigh: 0,
    rightThigh: 0,
    leftLeg: 0,
    rightLeg: 0,
  };
}

function emptySkinfolds(): Skinfolds {
  return {
    triceps: 0,
    subscapular: 0,
    chest: 0,
    midaxillary: 0,
    suprailiac: 0,
    abdominal: 0,
    thigh: 0,
  };
}
