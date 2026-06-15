"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, ArrowRight, CalendarDays, FileText, Scale, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { compareAssessments, sumSkinfolds } from "@/lib/calculations";
import { demoData } from "@/lib/demo-data";
import type { Assessment, Student } from "@/lib/types";

export function StudentHistory({ student, assessments }: { student: Student; assessments: Assessment[] }) {
  const ordered = useMemo(
    () => [...assessments].sort((a, b) => a.date.localeCompare(b.date)),
    [assessments],
  );
  const [firstId, setFirstId] = useState(ordered[0]?.id ?? "");
  const [secondId, setSecondId] = useState(ordered[1]?.id ?? ordered[0]?.id ?? "");

  const first = ordered.find((item) => item.id === firstId) ?? ordered[0];
  const second = ordered.find((item) => item.id === secondId) ?? ordered[1] ?? ordered[0];
  const comparison = first && second ? compareAssessments(first, second) : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground">Historico de acompanhamentos, evolucao e comparativo entre avaliacoes.</p>
        </div>
        <Button asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/dashboard/avaliacoes/nova">
            <Activity className="size-4" />
            Novo acompanhamento
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Avaliacoes" value={String(ordered.length)} detail="registros do aluno" icon={CalendarDays} />
        <SummaryCard title="Peso atual" value={`${second?.weight.toFixed(1) ?? "-"} kg`} detail={`inicial ${student.initialWeight} kg`} icon={Scale} />
        <SummaryCard title="Gordura" value={`${second?.bodyFat.toFixed(1) ?? "-"}%`} detail={comparison ? `${signed(comparison.bodyFat)} p.p.` : "sem comparativo"} icon={TrendingDown} />
        <SummaryCard title="Massa magra" value={`${second?.leanMass.toFixed(1) ?? "-"} kg`} detail={comparison ? `${signed(comparison.leanMass)} kg` : "sem comparativo"} icon={TrendingUp} />
      </section>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5 text-blue-500" />
            Comparar acompanhamentos
          </CardTitle>
          <CardDescription>Escolha duas avaliacoes do mesmo aluno para gerar o relatorio comparativo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <AssessmentSelect label="1o acompanhamento" value={firstId} onChange={setFirstId} assessments={ordered} />
          <AssessmentSelect label="2o acompanhamento" value={secondId} onChange={setSecondId} assessments={ordered} />
          <Button asChild className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Link href={`/dashboard/relatorios/comparativo?student=${student.id}&first=${firstId}&second=${secondId}`}>
              Gerar comparativo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Historico de avaliacoes</CardTitle>
          <CardDescription>Linha do tempo com os principais dados de cada acompanhamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>IMC</TableHead>
                <TableHead>% gordura</TableHead>
                <TableHead>Massa magra</TableHead>
                <TableHead>Soma dobras</TableHead>
                <TableHead className="text-right">Comparar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordered.map((assessment, index) => {
                const previous = ordered[index - 1];
                return (
                  <TableRow key={assessment.id}>
                    <TableCell>{formatDate(assessment.date)}</TableCell>
                    <TableCell>{assessment.weight.toFixed(1)} kg</TableCell>
                    <TableCell>{assessment.bmi.toFixed(1)}</TableCell>
                    <TableCell>{assessment.bodyFat.toFixed(1)}%</TableCell>
                    <TableCell>{assessment.leanMass.toFixed(1)} kg</TableCell>
                    <TableCell>{sumSkinfolds(assessment.skinfolds)} mm</TableCell>
                    <TableCell className="text-right">
                      {previous ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/relatorios/comparativo?student=${student.id}&first=${previous.id}&second=${assessment.id}`}>Anterior</Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Base</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export function StudentHistoryById({ studentId }: { studentId: string }) {
  const student = demoData.students.find((item) => item.id === studentId) ?? demoData.students[0];
  const assessments = demoData.assessments.filter((item) => item.studentId === student.id);
  return <StudentHistory student={student} assessments={assessments} />;
}

function AssessmentSelect({
  label,
  value,
  onChange,
  assessments,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  assessments: Assessment[];
}) {
  const selectedAssessment = assessments.find((assessment) => assessment.id === value);
  const selectedLabel = selectedAssessment ? formatAssessmentOption(selectedAssessment) : "Selecione um acompanhamento";

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <Select value={value} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger className="w-full" title={selectedLabel}>
          <span className="truncate text-left">{selectedLabel}</span>
        </SelectTrigger>
        <SelectContent>
          {assessments.map((assessment) => (
            <SelectItem key={assessment.id} value={assessment.id}>
              {formatAssessmentOption(assessment)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SummaryCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof CalendarDays }) {
  return (
    <Card className="rounded-md">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-black">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="grid size-11 place-items-center rounded-md bg-blue-600/10 text-blue-500">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatAssessmentOption(assessment: Assessment) {
  return `${formatDate(assessment.date)} - ${assessment.weight.toFixed(1)} kg / ${assessment.bodyFat.toFixed(1)}%`;
}

function signed(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}
