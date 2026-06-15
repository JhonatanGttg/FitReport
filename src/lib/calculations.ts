import type { Assessment, Measurements, Skinfolds, Student } from "@/lib/types";

export const measurementLabels: Record<keyof Measurements, string> = {
  shoulder: "Ombro",
  leftArm: "Braco esquerdo",
  rightArm: "Braco direito",
  waist: "Cintura",
  abdomen: "Abdomen",
  hip: "Quadril",
  leftThigh: "Coxa esquerda",
  rightThigh: "Coxa direita",
  leftLeg: "Perna esquerda",
  rightLeg: "Perna direita",
};

export const skinfoldLabels: Record<keyof Skinfolds, string> = {
  triceps: "Tricipital",
  subscapular: "Subescapular",
  chest: "Peitoral",
  midaxillary: "Axilar media",
  suprailiac: "Supra-iliaca",
  abdominal: "Abdominal",
  thigh: "Coxa",
};

export function calculateBmi(weight: number, height: number) {
  if (!weight || !height) return 0;
  return Number((weight / (height * height)).toFixed(1));
}

export function calculateComposition(weight: number, bodyFat: number) {
  const fatMass = Number((weight * (bodyFat / 100)).toFixed(1));
  return {
    fatMass,
    leanMass: Number((weight - fatMass).toFixed(1)),
  };
}

export function sumSkinfolds(skinfolds: Skinfolds) {
  return Number(Object.values(skinfolds).reduce((sum, value) => sum + Number(value || 0), 0).toFixed(1));
}

export function delta(current: number, previous: number) {
  return Number((current - previous).toFixed(1));
}

export function isHealthyBmiCloser(previous: number, current: number) {
  const target = 22;
  return Math.abs(current - target) < Math.abs(previous - target);
}

export function trendFor(metric: "weight" | "bmi" | "bodyFat" | "leanMass" | "fold" | "perimeter", previous: number, current: number) {
  if (metric === "leanMass") return current >= previous ? "improved" : "worsened";
  if (metric === "bmi") return isHealthyBmiCloser(previous, current) ? "improved" : "worsened";
  return current <= previous ? "improved" : "worsened";
}

export function compareAssessments(first: Assessment, second: Assessment) {
  const perimeterRows = Object.keys(measurementLabels).map((key) => {
    const field = key as keyof Measurements;
    return {
      label: measurementLabels[field],
      first: first.measurements[field],
      second: second.measurements[field],
      delta: delta(second.measurements[field], first.measurements[field]),
      trend: trendFor(field.includes("Arm") || field.includes("Thigh") ? "leanMass" : "perimeter", first.measurements[field], second.measurements[field]),
    };
  });

  const skinfoldRows = Object.keys(skinfoldLabels).map((key) => {
    const field = key as keyof Skinfolds;
    return {
      label: skinfoldLabels[field],
      first: first.skinfolds[field],
      second: second.skinfolds[field],
      delta: delta(second.skinfolds[field], first.skinfolds[field]),
      trend: trendFor("fold", first.skinfolds[field], second.skinfolds[field]),
    };
  });

  return {
    weight: delta(second.weight, first.weight),
    bmi: delta(second.bmi, first.bmi),
    bodyFat: delta(second.bodyFat, first.bodyFat),
    leanMass: delta(second.leanMass, first.leanMass),
    fatMass: delta(second.fatMass, first.fatMass),
    skinfoldSum: delta(sumSkinfolds(second.skinfolds), sumSkinfolds(first.skinfolds)),
    perimeterRows,
    skinfoldRows,
  };
}

export function generateProfessionalAnalysis(student: Student, first: Assessment, second: Assessment) {
  const comparison = compareAssessments(first, second);
  const improved: string[] = [];
  const worsened: string[] = [];
  const needs: string[] = [];
  const recommendations: string[] = [];

  if (comparison.bodyFat < 0) improved.push(`reduziu ${Math.abs(comparison.bodyFat)} p.p. de gordura corporal`);
  else worsened.push(`aumentou ${comparison.bodyFat} p.p. de gordura corporal`);

  if (comparison.leanMass > 0) improved.push(`ganhou ${comparison.leanMass} kg de massa magra`);
  else needs.push("proteger massa magra com treino resistido progressivo");

  if (comparison.skinfoldSum < 0) improved.push(`reduziu ${Math.abs(comparison.skinfoldSum)} mm na soma das 7 dobras`);
  else worsened.push("teve aumento na soma das dobras cutaneas");

  if (isHealthyBmiCloser(first.bmi, second.bmi)) improved.push("aproximou o IMC de uma faixa mais saudavel");
  else needs.push("acompanhar IMC junto da composicao corporal, sem olhar peso isolado");

  if (second.measurements.abdomen > first.measurements.abdomen || second.skinfolds.abdominal > first.skinfolds.abdominal) {
    needs.push("priorizar reducao abdominal com controle nutricional e cardio planejado");
  }

  recommendations.push("Treino: manter progressao de carga em movimentos multiarticulares e incluir acessorios para pontos fracos.");
  recommendations.push("Cardio: 2 a 4 sessoes semanais em zona moderada, ajustando volume conforme recuperacao.");
  recommendations.push("Alimentacao: reforcar proteina diaria, fibras e consistencia no deficit ou manutencao conforme objetivo.");
  recommendations.push("Descanso: sono de 7 a 9 horas e monitoramento de fadiga para preservar performance.");

  return {
    improved,
    worsened,
    needs,
    recommendations,
    analysis: `${student.name} apresentou ${improved.length ? improved.join(", ") : "estabilidade nos principais indicadores"}. ${worsened.length ? `Pontos de alerta: ${worsened.join(", ")}. ` : ""}${needs.length ? `Ajustes recomendados: ${needs.join(", ")}. ` : ""}A leitura geral sugere manter acompanhamento quinzenal/mensal e correlacionar medidas com adesao, carga de treino, ingestao proteica e qualidade de sono.`,
  };
}
