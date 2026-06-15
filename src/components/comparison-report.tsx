"use client";

import { useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AtSign,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Phone,
  RotateCcw,
  Ruler,
  Scale,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ReportExportActions, type ReportPdfData, type ReportPdfRow } from "@/components/report-export-actions";
import { compareAssessments, generateProfessionalAnalysis, sumSkinfolds } from "@/lib/calculations";
import { demoData } from "@/lib/demo-data";
import { useTrainerProfile } from "@/lib/trainer-profile-store";
import type { Assessment, Student, Trainer } from "@/lib/types";

type ComparisonReportProps = {
  student?: Student;
  first?: Assessment;
  second?: Assessment;
  trainerProfile?: Trainer;
};

export function ComparisonReport({
  student = demoData.students[0],
  first = demoData.assessments.find((item) => item.studentId === demoData.students[0].id)!,
  second = demoData.assessments.filter((item) => item.studentId === demoData.students[0].id)[1],
  trainerProfile,
}: ComparisonReportProps) {
  return (
    <ComparisonReportContent
      key={`${student.id}-${first.id}-${second.id}`}
      student={student}
      first={first}
      second={second}
      trainerProfile={trainerProfile}
    />
  );
}

function ComparisonReportContent({
  student,
  first,
  second,
  trainerProfile,
}: {
  student: Student;
  first: Assessment;
  second: Assessment;
  trainerProfile?: Trainer;
}) {
  const { trainer: localTrainer } = useTrainerProfile();
  const trainer = trainerProfile ?? localTrainer;
  const comparison = compareAssessments(first, second);
  const auto = generateProfessionalAnalysis(student, first, second);
  const autoRecommendationsText = auto.recommendations.join("\n");
  const [professionalAnalysis, setProfessionalAnalysis] = useState(auto.analysis);
  const [recommendationsText, setRecommendationsText] = useState(autoRecommendationsText);
  const firstDate = formatDate(first.date);
  const secondDate = formatDate(second.date);
  const whatsappMessage = `FitReport Pro - Relatorio de ${student.name}: peso ${comparison.weight} kg, gordura ${comparison.bodyFat} p.p., massa magra ${comparison.leanMass} kg.`;
  const recommendations = parseRecommendations(recommendationsText);

  const metrics = [
    {
      title: "Peso",
      icon: Scale,
      first: `${first.weight.toFixed(1)} kg`,
      second: `${second.weight.toFixed(1)} kg`,
      delta: signed(comparison.weight, "kg"),
      good: comparison.weight <= 0,
      direction: directionFrom(comparison.weight),
    },
    {
      title: "IMC",
      icon: UserRound,
      first: first.bmi.toFixed(1),
      second: second.bmi.toFixed(1),
      delta: signed(comparison.bmi, ""),
      good: comparison.bmi <= 0,
      direction: directionFrom(comparison.bmi),
    },
    {
      title: "% Gordura",
      icon: Activity,
      first: `${first.bodyFat.toFixed(1)}%`,
      second: `${second.bodyFat.toFixed(1)}%`,
      delta: signed(comparison.bodyFat, "p.p."),
      good: comparison.bodyFat <= 0,
      direction: directionFrom(comparison.bodyFat),
    },
    {
      title: "Massa magra",
      icon: Dumbbell,
      first: `${first.leanMass.toFixed(1)} kg`,
      second: `${second.leanMass.toFixed(1)} kg`,
      delta: signed(comparison.leanMass, "kg"),
      good: comparison.leanMass >= 0,
      direction: directionFrom(comparison.leanMass),
    },
  ];

  const perimeterRows = comparison.perimeterRows.map((row) => ({
    label: row.label,
    first: `${row.first} cm`,
    second: `${row.second} cm`,
    delta: signed(row.delta, "cm"),
    good: row.trend === "improved",
    direction: directionFrom(row.delta),
  }));

  const skinfoldRows = [
    ...comparison.skinfoldRows.map((row) => ({
      label: row.label,
      first: `${row.first} mm`,
      second: `${row.second} mm`,
      delta: signed(row.delta, "mm"),
      good: row.trend === "improved",
      direction: directionFrom(row.delta),
    })),
    {
      label: "Soma das 7 dobras",
      first: `${sumSkinfolds(first.skinfolds)} mm`,
      second: `${sumSkinfolds(second.skinfolds)} mm`,
      delta: signed(comparison.skinfoldSum, "mm"),
      good: comparison.skinfoldSum <= 0,
      direction: directionFrom(comparison.skinfoldSum),
    },
  ];

  const compositionRows = [
    {
      label: "Peso",
      first: `${first.weight.toFixed(1)} kg`,
      second: `${second.weight.toFixed(1)} kg`,
      delta: signed(comparison.weight, "kg"),
      good: comparison.weight <= 0,
      direction: directionFrom(comparison.weight),
    },
    {
      label: "IMC",
      first: first.bmi.toFixed(1),
      second: second.bmi.toFixed(1),
      delta: signed(comparison.bmi, ""),
      good: comparison.bmi <= 0,
      direction: directionFrom(comparison.bmi),
    },
    {
      label: "% Gordura",
      first: `${first.bodyFat.toFixed(1)}%`,
      second: `${second.bodyFat.toFixed(1)}%`,
      delta: signed(comparison.bodyFat, "p.p."),
      good: comparison.bodyFat <= 0,
      direction: directionFrom(comparison.bodyFat),
    },
    {
      label: "Massa magra",
      first: `${first.leanMass.toFixed(1)} kg`,
      second: `${second.leanMass.toFixed(1)} kg`,
      delta: signed(comparison.leanMass, "kg"),
      good: comparison.leanMass >= 0,
      direction: directionFrom(comparison.leanMass),
    },
  ];

  const reportData: ReportPdfData = {
    trainerName: trainer.name,
    trainerInstagram: trainer.instagram,
    trainerWhatsapp: trainer.whatsapp,
    signature: trainer.reportSignature,
    phrase: trainer.motivationalPhrase,
    studentName: student.name,
    studentMeta: `${student.sex}, ${student.age} anos`,
    height: `${Math.round(student.height * 100)} cm`,
    firstDate,
    secondDate,
    metrics: metrics.map(({ title, first, second, delta, good, direction }) => ({ title, first, second, delta, good, direction })),
    perimeterRows,
    skinfoldRows,
    compositionRows,
    improved: auto.improved,
    worsened: auto.worsened,
    needs: auto.needs,
    recommendations,
    analysis: professionalAnalysis,
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Relatorio comparativo</h1>
          <p className="text-muted-foreground">Modelo premium horizontal, mais visual e pronto para PDF, impressao e WhatsApp.</p>
        </div>
        <ReportExportActions targetId="fitness-report" message={whatsappMessage} reportData={reportData} />
      </div>

      <Card className="rounded-md border-blue-500/20 print:hidden">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue-500" />
              Ajustes do personal
            </CardTitle>
            <CardDescription>O sistema gera a base automaticamente; edite o texto final quando quiser personalizar a entrega.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => {
              setProfessionalAnalysis(auto.analysis);
              setRecommendationsText(autoRecommendationsText);
            }}
          >
            <RotateCcw className="size-4" />
            Restaurar automatico
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-2">
            <Label htmlFor="professional-analysis">Analise profissional</Label>
            <Textarea
              id="professional-analysis"
              className="min-h-36 resize-y"
              value={professionalAnalysis}
              onChange={(event) => setProfessionalAnalysis(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="professional-recommendations">Recomendacoes</Label>
            <Textarea
              id="professional-recommendations"
              className="min-h-36 resize-y"
              value={recommendationsText}
              onChange={(event) => setRecommendationsText(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <section
        id="fitness-report"
        className="print-landscape overflow-hidden rounded-md border bg-white text-slate-950 shadow-2xl"
      >
        <div className="relative min-h-[210mm] bg-white">
          <div className="relative overflow-hidden bg-[#030712] px-8 py-6 text-white">
            <div className="absolute inset-y-0 right-0 w-80 bg-[linear-gradient(135deg,transparent_15%,#0b2f83_48%,#2563eb_52%,transparent_56%)] opacity-90" />
            <div className="absolute right-0 top-0 h-full w-52 bg-[repeating-linear-gradient(140deg,rgba(37,99,235,0.95)_0_3px,transparent_3px_11px)] opacity-60" />
            <div className="relative grid gap-6 lg:grid-cols-[300px_1fr_300px]">
              <div className="flex items-center gap-4 border-r border-white/25 pr-6">
                <div className="grid size-24 place-items-center rounded-md border border-white/20 bg-white text-[#030712] shadow-xl">
                  <Dumbbell className="size-11" />
                  <span className="-mt-3 text-xl font-black">FR</span>
                </div>
                <div>
                  <p className="text-2xl font-black uppercase tracking-tight text-blue-500">{trainer.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.28em] text-white/70">Personal trainer</p>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">Relatorio comparativo</p>
                <h2 className="mt-1 text-4xl font-black uppercase leading-none tracking-tight">
                  Avaliacao <span className="text-blue-500">fisica</span>
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/78">
                  Analise comparativa entre a 1a e a 2a avaliacao fisica usando protocolo de 7 dobras de Pollock, perimetria e composicao corporal.
                </p>
              </div>

              <div className="grid gap-3 border-l border-white/25 pl-6 text-sm">
                <HeaderItem icon={CalendarDays} label="Avaliacoes" value={`1a: ${firstDate} | 2a: ${secondDate}`} />
                <HeaderItem icon={UserRound} label="Aluno" value={`${student.name}, ${student.age} anos`} />
                <HeaderItem icon={Ruler} label="Estatura" value={`${Math.round(student.height * 100)} cm`} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-8 py-4">
            <div className="grid gap-3 lg:grid-cols-4">
              {metrics.map((metric) => (
                <HeroMetric key={metric.title} {...metric} />
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4">
                <PremiumTable title="1. Comparativo de perimetria" headers={["Regioes", "1a avaliacao", "2a avaliacao", "Diferenca", "Evolucao"]} rows={perimeterRows} />
                <PremiumTable title="2. Comparativo das dobras cutaneas" subtitle="Protocolo de Pollock, 1984 - 7 Dobras" headers={["Dobras", "1a avaliacao", "2a avaliacao", "Diferenca", "Evolucao"]} rows={skinfoldRows} highlightLast />
                <AnalysisBlock analysis={professionalAnalysis} />
              </div>

              <div className="grid content-start gap-4">
                <PremiumTable title="3. Resumo da composicao corporal" headers={["Indicador", "1a avaliacao", "2a avaliacao", "Diferenca"]} rows={compositionRows} compact />
                <InsightPanel tone="good" title="O que melhorou" icon={TrendingUp} items={auto.improved} />
                <InsightPanel tone="bad" title="O que piorou" icon={TrendingDown} items={auto.worsened} />
                <InsightPanel tone="warn" title="O que precisa melhorar" icon={Target} items={auto.needs} />
                <InsightPanel tone="brand" title="Recomendacoes" icon={ClipboardList} items={recommendations} />
              </div>
            </div>
          </div>

          <footer className="mt-1 grid grid-cols-[1fr_1.1fr_1fr] items-center gap-5 bg-[#030712] px-8 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-md bg-white text-[#030712]">
                <Dumbbell className="size-6" />
              </div>
              <div>
                <p className="font-black uppercase text-blue-500">{trainer.name}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">Personal trainer</p>
              </div>
            </div>
            <p className="border-x border-white/20 px-6 text-center text-lg font-black uppercase tracking-tight">
              &quot;{trainer.motivationalPhrase}&quot;
            </p>
            <div className="grid justify-end gap-1 text-sm">
              <p className="flex items-center gap-2"><AtSign className="size-4 text-blue-500" /> {trainer.instagram}</p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-blue-500" /> {trainer.whatsapp}</p>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}

function HeaderItem({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-7 text-blue-500" />
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-white">{label}</p>
        <p className="text-white/78">{value}</p>
      </div>
    </div>
  );
}

function HeroMetric({
  title,
  icon: Icon,
  first,
  second,
  delta,
  good,
  direction,
}: {
  title: string;
  icon: typeof Scale;
  first: string;
  second: string;
  delta: string;
  good: boolean;
  direction: "up" | "down" | "neutral";
}) {
  return (
    <div className="grid grid-cols-[56px_1fr] gap-3 border-r border-blue-200 bg-white px-3 py-2 last:border-r-0">
      <div className="grid size-12 place-items-center rounded-md border border-blue-200 bg-blue-50 text-blue-950">
        <Icon className="size-7" />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-950">{title}</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          {first} <span className="mx-1 text-slate-400">-&gt;</span> {second}
        </p>
        <Badge className={good ? "mt-1 bg-emerald-600 text-white" : "mt-1 bg-red-600 text-white"}>
          <TrendIcon direction={direction} className="mr-1 size-3" />
          {delta}
        </Badge>
      </div>
    </div>
  );
}

function PremiumTable({
  title,
  subtitle,
  headers,
  rows,
  compact = false,
  highlightLast = false,
}: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: ReportPdfRow[];
  compact?: boolean;
  highlightLast?: boolean;
}) {
  return (
    <div>
      <h3 className="text-lg font-black uppercase leading-none text-slate-950">
        {title} {subtitle ? <span className="text-sm font-semibold normal-case text-slate-600">({subtitle})</span> : null}
      </h3>
      <div className="mt-2 overflow-hidden rounded-md border border-slate-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#061841] text-white">
              {headers.map((header) => (
                <th key={header} className="border-r border-white/15 px-3 py-2 text-left text-xs font-black uppercase last:border-r-0">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const last = highlightLast && index === rows.length - 1;
              return (
                <tr key={row.label} className={last ? "bg-blue-950 text-white" : index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className={cellClass(compact, last)}>{row.label}</td>
                  <td className={cellClass(compact, last)}>{row.first}</td>
                  <td className={cellClass(compact, last)}>{row.second}</td>
                  <td className={`${cellClass(compact, last)} font-black ${last ? "text-white" : row.good ? "text-emerald-700" : "text-red-600"}`}>{row.delta}</td>
                  {headers.length > 4 ? (
                    <td className={`${cellClass(compact, last)} ${last ? "text-white" : row.good ? "text-emerald-700" : "text-red-600"}`}>
                      <TrendIcon direction={row.direction} className="size-4" />
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cellClass(compact: boolean, dark: boolean) {
  return `border-r border-slate-200 px-3 ${compact ? "py-2" : "py-1.5"} text-left font-semibold last:border-r-0 ${dark ? "border-white/15" : ""}`;
}

function InsightPanel({
  tone,
  title,
  icon: Icon,
  items,
}: {
  tone: "good" | "bad" | "warn" | "brand";
  title: string;
  icon: typeof TrendingUp;
  items: string[];
}) {
  const toneMap = {
    good: "border-emerald-300 text-emerald-700 bg-emerald-50",
    bad: "border-red-300 text-red-700 bg-red-50",
    warn: "border-orange-300 text-orange-700 bg-orange-50",
    brand: "border-blue-300 text-blue-800 bg-blue-50",
  };

  return (
    <div className={`rounded-md border bg-white p-3 ${toneMap[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-md bg-white">
          <Icon className="size-7" />
        </div>
        <h3 className="text-base font-black uppercase">{title}</h3>
      </div>
      <ul className="mt-2 grid gap-1 pl-14 text-sm font-semibold leading-5 text-slate-900">
        {(items.length ? items : ["Sem alertas relevantes nesta comparacao."]).map((item) => (
          <li key={item} className="list-disc">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisBlock({ analysis }: { analysis: string }) {
  return (
    <div>
      <h3 className="text-lg font-black uppercase text-slate-950">4. Analise profissional</h3>
      <div className="mt-2 rounded-md border border-slate-300 bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-900">
        {analysis}
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function parseRecommendations(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim().replace(/^[-•]\s*/, ""))
    .filter(Boolean);
}

function directionFrom(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

function TrendIcon({ direction, className }: { direction: "up" | "down" | "neutral"; className?: string }) {
  if (direction === "up") return <ArrowUp className={className} />;
  if (direction === "down") return <ArrowDown className={className} />;
  return <ArrowRight className={className} />;
}

function signed(value: number, unit: string) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}
