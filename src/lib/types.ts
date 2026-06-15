export type Sex = "Masculino" | "Feminino" | "Outro";
export type StudentGoal = "Emagrecimento" | "Hipertrofia" | "Recomposicao corporal" | "Saude" | "Performance";
export type TrainingLevel = "Iniciante" | "Intermediario" | "Avancado";
export type SubscriptionPlan = "free" | "pro" | "studio";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";
export type ReportTemplate = "premium" | "compacto" | "evolucao";

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
  onboardingCompleted: boolean;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
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
  progressFrontUrl: string;
  progressSideUrl: string;
  progressBackUrl: string;
  goal: StudentGoal;
  trainingLevel: TrainingLevel;
  weeklyFrequency: number;
  restrictions: string;
  clinicalNotes: string;
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
  template: ReportTemplate;
  professionalAnalysis: string;
  improved: string[];
  worsened: string[];
  needs: string[];
  recommendations: string[];
  publicToken: string;
  publicEnabled: boolean;
  publicExpiresAt: string | null;
};

export type AppData = {
  trainer: Trainer;
  students: Student[];
  assessments: Assessment[];
  reports: Report[];
};
