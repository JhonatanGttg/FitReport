import { getDb } from "@/db/client";
import { assessments, bodyMeasurements, reports, skinfolds, students, trainers, users } from "@/db/schema";
import { generateProfessionalAnalysis } from "@/lib/calculations";
import { demoData } from "@/lib/demo-data";

const ids = {
  user: "11111111-1111-4111-8111-111111111111",
  trainer: "22222222-2222-4222-8222-222222222222",
  students: {
    "student-ana": "33333333-3333-4333-8333-333333333331",
    "student-rafael": "33333333-3333-4333-8333-333333333332",
    "student-luiza": "33333333-3333-4333-8333-333333333333",
  },
  assessments: {
    "ana-1": "44444444-4444-4444-8444-444444444441",
    "ana-2": "44444444-4444-4444-8444-444444444442",
    "rafael-1": "44444444-4444-4444-8444-444444444443",
    "rafael-2": "44444444-4444-4444-8444-444444444444",
    "luiza-1": "44444444-4444-4444-8444-444444444445",
    "luiza-2": "44444444-4444-4444-8444-444444444446",
  },
  report: "55555555-5555-4555-8555-555555555555",
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL ausente. Seed demo disponivel no app via src/lib/demo-data.ts.");
    return;
  }

  const db = getDb();
  const trainer = demoData.trainer;

  await db.insert(users).values({
    id: ids.user,
    email: "personal@fitreport.pro",
    name: trainer.name,
  }).onConflictDoUpdate({
    target: users.id,
    set: { email: "personal@fitreport.pro", name: trainer.name },
  });

  await db.insert(trainers).values({
    ...trainer,
    id: ids.trainer,
    userId: ids.user,
  }).onConflictDoUpdate({
    target: trainers.id,
    set: {
      name: trainer.name,
      logoUrl: trainer.logoUrl,
      photoUrl: trainer.photoUrl,
      instagram: trainer.instagram,
      whatsapp: trainer.whatsapp,
      brandPrimary: trainer.brandPrimary,
      brandSecondary: trainer.brandSecondary,
      motivationalPhrase: trainer.motivationalPhrase,
      reportSignature: trainer.reportSignature,
    },
  });

  for (const student of demoData.students) {
    await db.insert(students).values({
      ...student,
      id: ids.students[student.id as keyof typeof ids.students],
      trainerId: ids.trainer,
    }).onConflictDoUpdate({
      target: students.id,
      set: {
        name: student.name,
        sex: student.sex,
        age: student.age,
        birthDate: student.birthDate,
        height: student.height,
        initialWeight: student.initialWeight,
        photoUrl: student.photoUrl,
        notes: student.notes,
      },
    });
  }

  for (const assessment of demoData.assessments) {
    const assessmentId = ids.assessments[assessment.id as keyof typeof ids.assessments];
    await db.insert(assessments).values({
      id: assessmentId,
      trainerId: ids.trainer,
      studentId: ids.students[assessment.studentId as keyof typeof ids.students],
      date: assessment.date,
      weight: assessment.weight,
      height: assessment.height,
      bmi: assessment.bmi,
      bodyFat: assessment.bodyFat,
      leanMass: assessment.leanMass,
      fatMass: assessment.fatMass,
    }).onConflictDoUpdate({
      target: assessments.id,
      set: {
        date: assessment.date,
        weight: assessment.weight,
        height: assessment.height,
        bmi: assessment.bmi,
        bodyFat: assessment.bodyFat,
        leanMass: assessment.leanMass,
        fatMass: assessment.fatMass,
      },
    });

    await db.insert(bodyMeasurements).values({
      assessmentId,
      ...assessment.measurements,
    }).onConflictDoUpdate({
      target: bodyMeasurements.assessmentId,
      set: assessment.measurements,
    });

    await db.insert(skinfolds).values({
      assessmentId,
      ...assessment.skinfolds,
    }).onConflictDoUpdate({
      target: skinfolds.assessmentId,
      set: assessment.skinfolds,
    });
  }

  const ana = demoData.students[0];
  const first = demoData.assessments[0];
  const second = demoData.assessments[1];
  await db.insert(reports).values({
    id: ids.report,
    trainerId: ids.trainer,
    studentId: ids.students[ana.id as keyof typeof ids.students],
    firstAssessmentId: ids.assessments[first.id as keyof typeof ids.assessments],
    secondAssessmentId: ids.assessments[second.id as keyof typeof ids.assessments],
    professionalAnalysis: generateProfessionalAnalysis(ana, first, second).analysis,
  }).onConflictDoUpdate({
    target: reports.id,
    set: {
      professionalAnalysis: generateProfessionalAnalysis(ana, first, second).analysis,
    },
  });

  console.log(`Seed real concluido: ${demoData.students.length} alunos e ${demoData.assessments.length} avaliacoes.`);
}

main().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
