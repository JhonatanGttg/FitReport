export type Sex = "Masculino" | "Feminino" | "Outro";

export type Trainer = {
  id: string;
  userId: string;
  name: string;
  logoUrl: string;
  photoUrl: string;
  instagram: string;
  whatsapp: string;
  brandPrimary: string;
  brandSecondary: string;
  motivationalPhrase: string;
  reportSignature: string;
};

export type Student = {
  id: string;
  trainerId: string;
  name: string;
  sex: Sex;
  age: number;
  birthDate: string;
  height: number;
  initialWeight: number;
  photoUrl: string;
  notes: string;
};

export type Measurements = {
  shoulder: number;
  leftArm: number;
  rightArm: number;
  waist: number;
  abdomen: number;
  hip: number;
  leftThigh: number;
  rightThigh: number;
  leftLeg: number;
  rightLeg: number;
};

export type Skinfolds = {
  triceps: number;
  subscapular: number;
  chest: number;
  midaxillary: number;
  suprailiac: number;
  abdominal: number;
  thigh: number;
};

export type Assessment = {
  id: string;
  studentId: string;
  trainerId: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bodyFat: number;
  leanMass: number;
  fatMass: number;
  measurements: Measurements;
  skinfolds: Skinfolds;
};

export type Report = {
  id: string;
  trainerId: string;
  studentId: string;
  firstAssessmentId: string;
  secondAssessmentId: string;
  createdAt: string;
  professionalAnalysis: string;
};

export type AppData = {
  trainer: Trainer;
  students: Student[];
  assessments: Assessment[];
  reports: Report[];
};
