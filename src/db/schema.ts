import { relations } from "drizzle-orm";
import { boolean, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trainers = pgTable("trainers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  logoUrl: text("logo_url").default("").notNull(),
  photoUrl: text("photo_url").default("").notNull(),
  instagram: text("instagram").default("").notNull(),
  whatsapp: text("whatsapp").default("").notNull(),
  brandPrimary: text("brand_primary").default("#2563eb").notNull(),
  brandSecondary: text("brand_secondary").default("#020617").notNull(),
  motivationalPhrase: text("motivational_phrase").default("").notNull(),
  reportSignature: text("report_signature").default("").notNull(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  plan: text("plan").default("free").notNull(),
  subscriptionStatus: text("subscription_status").default("trial").notNull(),
  stripeCustomerId: text("stripe_customer_id").default("").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("trainers_user_id_idx").on(table.userId)]);

export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id").references(() => trainers.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  sex: text("sex").notNull(),
  age: integer("age").notNull(),
  birthDate: text("birth_date").notNull(),
  height: numeric("height", { mode: "number" }).notNull(),
  initialWeight: numeric("initial_weight", { mode: "number" }).notNull(),
  photoUrl: text("photo_url").default("").notNull(),
  progressFrontUrl: text("progress_front_url").default("").notNull(),
  progressSideUrl: text("progress_side_url").default("").notNull(),
  progressBackUrl: text("progress_back_url").default("").notNull(),
  goal: text("goal").default("Recomposicao corporal").notNull(),
  trainingLevel: text("training_level").default("Intermediario").notNull(),
  weeklyFrequency: integer("weekly_frequency").default(3).notNull(),
  restrictions: text("restrictions").default("").notNull(),
  clinicalNotes: text("clinical_notes").default("").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("students_trainer_id_idx").on(table.trainerId)]);

export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id").references(() => trainers.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  date: text("date").notNull(),
  weight: numeric("weight", { mode: "number" }).notNull(),
  height: numeric("height", { mode: "number" }).notNull(),
  bmi: numeric("bmi", { mode: "number" }).notNull(),
  bodyFat: numeric("body_fat", { mode: "number" }).notNull(),
  leanMass: numeric("lean_mass", { mode: "number" }).notNull(),
  fatMass: numeric("fat_mass", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("assessments_trainer_id_idx").on(table.trainerId),
  index("assessments_student_id_idx").on(table.studentId),
]);

export const bodyMeasurements = pgTable("body_measurements", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessmentId: uuid("assessment_id").references(() => assessments.id, { onDelete: "cascade" }).notNull(),
  shoulder: numeric("shoulder", { mode: "number" }).notNull(),
  leftArm: numeric("left_arm", { mode: "number" }).notNull(),
  rightArm: numeric("right_arm", { mode: "number" }).notNull(),
  waist: numeric("waist", { mode: "number" }).notNull(),
  abdomen: numeric("abdomen", { mode: "number" }).notNull(),
  hip: numeric("hip", { mode: "number" }).notNull(),
  leftThigh: numeric("left_thigh", { mode: "number" }).notNull(),
  rightThigh: numeric("right_thigh", { mode: "number" }).notNull(),
  leftLeg: numeric("left_leg", { mode: "number" }).notNull(),
  rightLeg: numeric("right_leg", { mode: "number" }).notNull(),
}, (table) => [uniqueIndex("body_measurements_assessment_id_unique").on(table.assessmentId)]);

export const skinfolds = pgTable("skinfolds", {
  id: uuid("id").primaryKey().defaultRandom(),
  assessmentId: uuid("assessment_id").references(() => assessments.id, { onDelete: "cascade" }).notNull(),
  triceps: numeric("triceps", { mode: "number" }).notNull(),
  subscapular: numeric("subscapular", { mode: "number" }).notNull(),
  chest: numeric("chest", { mode: "number" }).notNull(),
  midaxillary: numeric("midaxillary", { mode: "number" }).notNull(),
  suprailiac: numeric("suprailiac", { mode: "number" }).notNull(),
  abdominal: numeric("abdominal", { mode: "number" }).notNull(),
  thigh: numeric("thigh", { mode: "number" }).notNull(),
}, (table) => [uniqueIndex("skinfolds_assessment_id_unique").on(table.assessmentId)]);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: uuid("trainer_id").references(() => trainers.id, { onDelete: "cascade" }).notNull(),
  studentId: uuid("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  firstAssessmentId: uuid("first_assessment_id").references(() => assessments.id, { onDelete: "cascade" }).notNull(),
  secondAssessmentId: uuid("second_assessment_id").references(() => assessments.id, { onDelete: "cascade" }).notNull(),
  template: text("template").default("premium").notNull(),
  professionalAnalysis: text("professional_analysis").notNull(),
  improved: text("improved").default("").notNull(),
  worsened: text("worsened").default("").notNull(),
  needs: text("needs").default("").notNull(),
  recommendations: text("recommendations").default("").notNull(),
  publicToken: text("public_token").default("").notNull(),
  publicEnabled: boolean("public_enabled").default(false).notNull(),
  publicExpiresAt: timestamp("public_expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("reports_trainer_id_idx").on(table.trainerId),
  index("reports_student_id_idx").on(table.studentId),
  index("reports_public_token_idx").on(table.publicToken),
]);

export const trainersRelations = relations(trainers, ({ many, one }) => ({
  user: one(users, { fields: [trainers.userId], references: [users.id] }),
  students: many(students),
  assessments: many(assessments),
  reports: many(reports),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  trainer: one(trainers, { fields: [students.trainerId], references: [trainers.id] }),
  assessments: many(assessments),
  reports: many(reports),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  trainer: one(trainers, { fields: [assessments.trainerId], references: [trainers.id] }),
  student: one(students, { fields: [assessments.studentId], references: [students.id] }),
  measurements: one(bodyMeasurements),
  skinfolds: one(skinfolds),
}));
