import { supabase } from "@/lib/supabase/client";
import { calculateBmi, calculateComposition } from "@/lib/calculations";
import type { AppData, Assessment, Measurements, Report, Skinfolds, Student, Trainer } from "@/lib/types";

type DbTrainer = {
  id: string;
  user_id: string;
  name: string;
  logo_url: string;
  photo_url: string;
  instagram: string;
  whatsapp: string;
  brand_primary: string;
  brand_secondary: string;
  motivational_phrase: string;
  report_signature: string;
  onboarding_completed: boolean;
  plan: string;
  subscription_status: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
};

type DbStudent = {
  id: string;
  trainer_id: string;
  name: string;
  sex: string;
  age: number;
  birth_date: string;
  height: number;
  initial_weight: number;
  photo_url: string;
  progress_front_url: string;
  progress_side_url: string;
  progress_back_url: string;
  goal: string;
  training_level: string;
  weekly_frequency: number;
  restrictions: string;
  clinical_notes: string;
  notes: string;
};

type DbAssessment = {
  id: string;
  trainer_id: string;
  student_id: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  body_fat: number;
  lean_mass: number;
  fat_mass: number;
  created_at: string;
};

type DbMeasurement = {
  assessment_id: string;
  shoulder: number;
  left_arm: number;
  right_arm: number;
  waist: number;
  abdomen: number;
  hip: number;
  left_thigh: number;
  right_thigh: number;
  left_leg: number;
  right_leg: number;
};
type DbSkinfolds = Skinfolds & { assessment_id: string };

type DbReport = {
  id: string;
  trainer_id: string;
  student_id: string;
  first_assessment_id: string;
  second_assessment_id: string;
  template: string;
  professional_analysis: string;
  improved: string;
  worsened: string;
  needs: string;
  recommendations: string;
  public_token: string;
  public_enabled: boolean;
  public_expires_at: string | null;
  created_at: string;
};

export async function getSessionUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase nao configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUp(name: string, email: string, password: string) {
  if (!supabase) throw new Error("Supabase nao configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.");
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
  if (data.session && data.user) await ensureTrainerProfile(data.user.id, email, name);
  return Boolean(data.session);
}

export async function resetPassword(email: string) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function ensureTrainerProfile(userId: string, email: string, name: string) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const fallbackName = name || email.split("@")[0] || "Personal Trainer";

  const { error: userError } = await supabase
    .from("users")
    .upsert({ id: userId, email, name: fallbackName }, { onConflict: "id" });
  if (userError) throw userError;

  const { data: existing, error: existingError } = await supabase
    .from("trainers")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return mapTrainer(existing as DbTrainer);

  const { data, error } = await supabase
    .from("trainers")
    .insert({
      user_id: userId,
      name: fallbackName,
      instagram: "",
      whatsapp: "",
      brand_primary: "#2563eb",
      brand_secondary: "#020617",
      motivational_phrase: "Evolucao mensuravel, treino inteligente.",
      report_signature: `${fallbackName} - Personal Trainer`,
      onboarding_completed: false,
      plan: "free",
      subscription_status: "trial",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapTrainer(data as DbTrainer);
}

export async function loadAppData(): Promise<AppData> {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const user = await getSessionUser();
  if (!user?.email) throw new Error("Sessao expirada. Faca login novamente.");

  const trainer = await ensureTrainerProfile(user.id, user.email, user.user_metadata?.name ?? "");

  const [{ data: studentRows, error: studentsError }, { data: assessmentRows, error: assessmentsError }, { data: reportRows, error: reportsError }] = await Promise.all([
    supabase.from("students").select("*").eq("trainer_id", trainer.id).order("name"),
    supabase.from("assessments").select("*").eq("trainer_id", trainer.id).order("date"),
    supabase.from("reports").select("*").eq("trainer_id", trainer.id).order("created_at", { ascending: false }),
  ]);
  if (studentsError) throw studentsError;
  if (assessmentsError) throw assessmentsError;
  if (reportsError) throw reportsError;

  const assessmentIds = (assessmentRows ?? []).map((item) => item.id);
  const [measurementResult, skinfoldResult] = assessmentIds.length
    ? await Promise.all([
        supabase.from("body_measurements").select("*").in("assessment_id", assessmentIds),
        supabase.from("skinfolds").select("*").in("assessment_id", assessmentIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];
  if (measurementResult.error) throw measurementResult.error;
  if (skinfoldResult.error) throw skinfoldResult.error;

  return {
    trainer,
    students: (studentRows ?? []).map((row) => mapStudent(row as DbStudent)),
    assessments: (assessmentRows ?? []).map((row) => {
      const measurement = (measurementResult.data ?? []).find((item) => item.assessment_id === row.id) as DbMeasurement | undefined;
      const folds = (skinfoldResult.data ?? []).find((item) => item.assessment_id === row.id) as DbSkinfolds | undefined;
      return mapAssessment(row as DbAssessment, measurement, folds);
    }),
    reports: (reportRows ?? []).map((row) => mapReport(row as DbReport)),
  };
}

export async function saveTrainer(trainer: Trainer) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("trainers")
    .update({
      name: trainer.name,
      logo_url: trainer.logoUrl,
      photo_url: trainer.photoUrl,
      instagram: trainer.instagram,
      whatsapp: trainer.whatsapp,
      brand_primary: trainer.brandPrimary,
      brand_secondary: trainer.brandSecondary,
      motivational_phrase: trainer.motivationalPhrase,
      report_signature: trainer.reportSignature,
      onboarding_completed: trainer.onboardingCompleted,
    })
    .eq("id", trainer.id)
    .select("*")
    .single();
  if (error) throw error;
  return mapTrainer(data as DbTrainer);
}

export async function saveStudent(student: Student) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const payload = {
    trainer_id: student.trainerId,
    name: student.name,
    sex: student.sex,
    age: student.age,
    birth_date: student.birthDate,
    height: student.height,
    initial_weight: student.initialWeight,
    photo_url: student.photoUrl,
    progress_front_url: student.progressFrontUrl,
    progress_side_url: student.progressSideUrl,
    progress_back_url: student.progressBackUrl,
    goal: student.goal,
    training_level: student.trainingLevel,
    weekly_frequency: student.weeklyFrequency,
    restrictions: student.restrictions,
    clinical_notes: student.clinicalNotes,
    notes: student.notes,
  };
  const query = student.id
    ? supabase.from("students").update(payload).eq("id", student.id).select("*").single()
    : supabase.from("students").insert(payload).select("*").single();
  const { data, error } = await query;
  if (error) throw error;
  return mapStudent(data as DbStudent);
}

export async function deleteStudent(id: string) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

export async function saveAssessment(input: {
  trainerId: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bodyFat: number;
  measurements: Measurements;
  skinfolds: Skinfolds;
}) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const bmi = calculateBmi(input.weight, input.height);
  const composition = calculateComposition(input.weight, input.bodyFat);
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      trainer_id: input.trainerId,
      student_id: input.studentId,
      date: input.date,
      weight: input.weight,
      height: input.height,
      bmi,
      body_fat: input.bodyFat,
      lean_mass: composition.leanMass,
      fat_mass: composition.fatMass,
    })
    .select("*")
    .single();
  if (error) throw error;

  const assessment = data as DbAssessment;
  const [{ error: measurementError }, { error: skinfoldError }] = await Promise.all([
    supabase.from("body_measurements").insert({
      assessment_id: assessment.id,
      shoulder: input.measurements.shoulder,
      left_arm: input.measurements.leftArm,
      right_arm: input.measurements.rightArm,
      waist: input.measurements.waist,
      abdomen: input.measurements.abdomen,
      hip: input.measurements.hip,
      left_thigh: input.measurements.leftThigh,
      right_thigh: input.measurements.rightThigh,
      left_leg: input.measurements.leftLeg,
      right_leg: input.measurements.rightLeg,
    }),
    supabase.from("skinfolds").insert({ assessment_id: assessment.id, ...input.skinfolds }),
  ]);
  if (measurementError) throw measurementError;
  if (skinfoldError) throw skinfoldError;

  return mapAssessment(
    assessment,
    {
      assessment_id: assessment.id,
      shoulder: input.measurements.shoulder,
      left_arm: input.measurements.leftArm,
      right_arm: input.measurements.rightArm,
      waist: input.measurements.waist,
      abdomen: input.measurements.abdomen,
      hip: input.measurements.hip,
      left_thigh: input.measurements.leftThigh,
      right_thigh: input.measurements.rightThigh,
      left_leg: input.measurements.leftLeg,
      right_leg: input.measurements.rightLeg,
    },
    { assessment_id: assessment.id, ...input.skinfolds },
  );
}

export async function saveReport(input: {
  trainerId: string;
  studentId: string;
  firstAssessmentId: string;
  secondAssessmentId: string;
  professionalAnalysis: string;
  recommendations: string[];
  improved: string[];
  worsened: string[];
  needs: string[];
}) {
  if (!supabase) throw new Error("Supabase nao configurado.");
  const { data, error } = await supabase
    .from("reports")
    .insert({
      trainer_id: input.trainerId,
      student_id: input.studentId,
      first_assessment_id: input.firstAssessmentId,
      second_assessment_id: input.secondAssessmentId,
      template: "premium",
      professional_analysis: input.professionalAnalysis,
      recommendations: JSON.stringify(input.recommendations),
      improved: JSON.stringify(input.improved),
      worsened: JSON.stringify(input.worsened),
      needs: JSON.stringify(input.needs),
      public_enabled: false,
      public_token: "",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapReport(data as DbReport);
}

function mapTrainer(row: DbTrainer): Trainer {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    logoUrl: row.logo_url ?? "",
    photoUrl: row.photo_url ?? "",
    instagram: row.instagram ?? "",
    whatsapp: row.whatsapp ?? "",
    brandPrimary: row.brand_primary ?? "#2563eb",
    brandSecondary: row.brand_secondary ?? "#020617",
    motivationalPhrase: row.motivational_phrase ?? "",
    reportSignature: row.report_signature ?? "",
    onboardingCompleted: row.onboarding_completed ?? false,
    plan: row.plan as Trainer["plan"],
    subscriptionStatus: row.subscription_status as Trainer["subscriptionStatus"],
    stripeCustomerId: row.stripe_customer_id ?? "",
    stripeSubscriptionId: row.stripe_subscription_id ?? "",
  };
}

function mapStudent(row: DbStudent): Student {
  return {
    id: row.id,
    trainerId: row.trainer_id,
    name: row.name,
    sex: row.sex as Student["sex"],
    age: Number(row.age),
    birthDate: row.birth_date,
    height: Number(row.height),
    initialWeight: Number(row.initial_weight),
    photoUrl: row.photo_url ?? "",
    progressFrontUrl: row.progress_front_url ?? "",
    progressSideUrl: row.progress_side_url ?? "",
    progressBackUrl: row.progress_back_url ?? "",
    goal: row.goal as Student["goal"],
    trainingLevel: row.training_level as Student["trainingLevel"],
    weeklyFrequency: Number(row.weekly_frequency ?? 0),
    restrictions: row.restrictions ?? "",
    clinicalNotes: row.clinical_notes ?? "",
    notes: row.notes ?? "",
  };
}

function mapAssessment(row: DbAssessment, measurement?: DbMeasurement, folds?: DbSkinfolds): Assessment {
  return {
    id: row.id,
    trainerId: row.trainer_id,
    studentId: row.student_id,
    date: row.date,
    weight: Number(row.weight),
    height: Number(row.height),
    bmi: Number(row.bmi),
    bodyFat: Number(row.body_fat),
    leanMass: Number(row.lean_mass),
    fatMass: Number(row.fat_mass),
    measurements: measurement ? normalizeMeasurements(measurement) : emptyMeasurements(),
    skinfolds: folds ? normalizeSkinfolds(folds) : emptySkinfolds(),
  };
}

function mapReport(row: DbReport): Report {
  return {
    id: row.id,
    trainerId: row.trainer_id,
    studentId: row.student_id,
    firstAssessmentId: row.first_assessment_id,
    secondAssessmentId: row.second_assessment_id,
    template: row.template as Report["template"],
    professionalAnalysis: row.professional_analysis,
    improved: parseList(row.improved),
    worsened: parseList(row.worsened),
    needs: parseList(row.needs),
    recommendations: parseList(row.recommendations),
    publicToken: row.public_token,
    publicEnabled: row.public_enabled,
    publicExpiresAt: row.public_expires_at,
    createdAt: row.created_at,
  };
}

function parseList(value: string) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  }
}

function normalizeMeasurements(row: DbMeasurement): Measurements {
  return {
    shoulder: Number(row.shoulder),
    leftArm: Number(row.left_arm),
    rightArm: Number(row.right_arm),
    waist: Number(row.waist),
    abdomen: Number(row.abdomen),
    hip: Number(row.hip),
    leftThigh: Number(row.left_thigh),
    rightThigh: Number(row.right_thigh),
    leftLeg: Number(row.left_leg),
    rightLeg: Number(row.right_leg),
  };
}

function normalizeSkinfolds(row: DbSkinfolds): Skinfolds {
  return {
    triceps: Number(row.triceps),
    subscapular: Number(row.subscapular),
    chest: Number(row.chest),
    midaxillary: Number(row.midaxillary),
    suprailiac: Number(row.suprailiac),
    abdominal: Number(row.abdominal),
    thigh: Number(row.thigh),
  };
}

function emptyMeasurements(): Measurements {
  return { shoulder: 0, leftArm: 0, rightArm: 0, waist: 0, abdomen: 0, hip: 0, leftThigh: 0, rightThigh: 0, leftLeg: 0, rightLeg: 0 };
}

function emptySkinfolds(): Skinfolds {
  return { triceps: 0, subscapular: 0, chest: 0, midaxillary: 0, suprailiac: 0, abdominal: 0, thigh: 0 };
}
