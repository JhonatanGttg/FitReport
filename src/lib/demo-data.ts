import type { AppData, Assessment, Measurements, Skinfolds } from "@/lib/types";

const measurements = (
  shoulder: number,
  leftArm: number,
  rightArm: number,
  waist: number,
  abdomen: number,
  hip: number,
  leftThigh: number,
  rightThigh: number,
  leftLeg: number,
  rightLeg: number,
): Measurements => ({
  shoulder,
  leftArm,
  rightArm,
  waist,
  abdomen,
  hip,
  leftThigh,
  rightThigh,
  leftLeg,
  rightLeg,
});

const skinfolds = (
  triceps: number,
  subscapular: number,
  chest: number,
  midaxillary: number,
  suprailiac: number,
  abdominal: number,
  thigh: number,
): Skinfolds => ({
  triceps,
  subscapular,
  chest,
  midaxillary,
  suprailiac,
  abdominal,
  thigh,
});

function assessment(
  id: string,
  studentId: string,
  date: string,
  weight: number,
  height: number,
  bodyFat: number,
  m: Measurements,
  s: Skinfolds,
): Assessment {
  const bmi = Number((weight / (height * height)).toFixed(1));
  const fatMass = Number((weight * (bodyFat / 100)).toFixed(1));
  const leanMass = Number((weight - fatMass).toFixed(1));

  return {
    id,
    studentId,
    trainerId: "trainer-demo",
    date,
    weight,
    height,
    bmi,
    bodyFat,
    leanMass,
    fatMass,
    measurements: m,
    skinfolds: s,
  };
}

export const demoData: AppData = {
  trainer: {
    id: "trainer-demo",
    userId: "user-demo",
    name: "Marina Costa",
    logoUrl: "",
    photoUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=600&auto=format&fit=crop",
    instagram: "@marinacosta.fit",
    whatsapp: "+55 81 99999-0000",
    brandPrimary: "#2563eb",
    brandSecondary: "#020617",
    motivationalPhrase: "Evolucao mensuravel, treino inteligente.",
    reportSignature: "Marina Costa - CREF 123456-G/PE",
  },
  students: [
    {
      id: "student-ana",
      trainerId: "trainer-demo",
      name: "Ana Beatriz Lima",
      sex: "Feminino",
      age: 31,
      birthDate: "1995-03-18",
      height: 1.65,
      initialWeight: 72.4,
      photoUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop",
      notes: "Objetivo principal: reduzir gordura abdominal e ganhar condicionamento.",
    },
    {
      id: "student-rafael",
      trainerId: "trainer-demo",
      name: "Rafael Torres",
      sex: "Masculino",
      age: 38,
      birthDate: "1988-08-07",
      height: 1.78,
      initialWeight: 91.2,
      photoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=600&auto=format&fit=crop",
      notes: "Foco em recomposicao corporal e melhora postural.",
    },
    {
      id: "student-luiza",
      trainerId: "trainer-demo",
      name: "Luiza Martins",
      sex: "Feminino",
      age: 27,
      birthDate: "1999-11-22",
      height: 1.7,
      initialWeight: 63.8,
      photoUrl: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?q=80&w=600&auto=format&fit=crop",
      notes: "Hipertrofia com manutencao de percentual de gordura.",
    },
  ],
  assessments: [
    assessment("ana-1", "student-ana", "2026-02-03", 72.4, 1.65, 31.2, measurements(106, 31, 31.5, 83, 91, 104, 58, 58.5, 38, 38.2), skinfolds(24, 26, 18, 22, 25, 31, 29)),
    assessment("ana-2", "student-ana", "2026-05-29", 68.1, 1.65, 27.4, measurements(105, 30.5, 31, 78, 85, 101, 56.5, 57, 37.2, 37.5), skinfolds(20, 22, 15, 18, 21, 25, 24)),
    assessment("rafael-1", "student-rafael", "2026-01-20", 91.2, 1.78, 24.6, measurements(121, 36, 36.4, 96, 101, 103, 62, 62, 41, 41), skinfolds(18, 24, 16, 20, 23, 30, 21)),
    assessment("rafael-2", "student-rafael", "2026-05-26", 88.5, 1.78, 21.8, measurements(122, 37, 37.3, 91, 96, 102, 63, 63.2, 41.5, 41.6), skinfolds(15, 20, 13, 17, 19, 24, 18)),
    assessment("luiza-1", "student-luiza", "2026-02-12", 63.8, 1.7, 22.5, measurements(103, 28, 28, 70, 78, 96, 55, 55, 36, 36), skinfolds(17, 18, 12, 15, 16, 20, 19)),
    assessment("luiza-2", "student-luiza", "2026-05-31", 65.1, 1.7, 21.9, measurements(105, 29.5, 29.3, 69, 77, 97, 56.5, 56, 36.5, 36.4), skinfolds(16, 17, 11, 14, 15, 19, 18)),
  ],
  reports: [
    {
      id: "report-ana",
      trainerId: "trainer-demo",
      studentId: "student-ana",
      firstAssessmentId: "ana-1",
      secondAssessmentId: "ana-2",
      createdAt: "2026-05-30",
      professionalAnalysis: "Ana apresentou reducao consistente de gordura e queda importante em abdomen e cintura, mantendo massa magra em faixa adequada para a fase atual.",
    },
  ],
};
