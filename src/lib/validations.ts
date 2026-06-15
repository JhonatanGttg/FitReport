import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "Use pelo menos 6 caracteres."),
});

export const trainerSchema = z.object({
  name: z.string().min(2),
  logoUrl: z.string().url().or(z.literal("")),
  photoUrl: z.string().url().or(z.literal("")),
  instagram: z.string().min(2),
  whatsapp: z.string().min(8),
  brandPrimary: z.string().min(4),
  brandSecondary: z.string().min(4),
  motivationalPhrase: z.string().min(4),
  reportSignature: z.string().min(4),
});

export const studentSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio."),
  sex: z.enum(["Masculino", "Feminino", "Outro"]),
  age: z.coerce.number().min(1).max(120),
  birthDate: z.string().min(8),
  height: z.coerce.number().min(0.5).max(2.5),
  initialWeight: z.coerce.number().min(20).max(350),
  photoUrl: z.string().url().or(z.literal("")),
  notes: z.string().optional().default(""),
});

const positive = z.coerce.number().min(0).max(400);

export const assessmentSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().min(8),
  weight: z.coerce.number().min(20).max(350),
  height: z.coerce.number().min(0.5).max(2.5),
  bodyFat: z.coerce.number().min(1).max(70),
  measurements: z.object({
    shoulder: positive,
    leftArm: positive,
    rightArm: positive,
    waist: positive,
    abdomen: positive,
    hip: positive,
    leftThigh: positive,
    rightThigh: positive,
    leftLeg: positive,
    rightLeg: positive,
  }),
  skinfolds: z.object({
    triceps: positive,
    subscapular: positive,
    chest: positive,
    midaxillary: positive,
    suprailiac: positive,
    abdominal: positive,
    thigh: positive,
  }),
});
