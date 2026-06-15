"use client";

import Link from "next/link";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, Scale, Trophy, TrendingUp, UsersRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/metric-card";
import { compareAssessments } from "@/lib/calculations";
import { demoData } from "@/lib/demo-data";
import type { AppData } from "@/lib/types";

export function DashboardOverview({ data = demoData, today = "2026-06-15" }: { data?: AppData; today?: string }) {
  const { students, assessments } = data;
  const pairs = students.map((student) => {
    const ordered = assessments.filter((item) => item.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
    const first = ordered.at(-2);
    const second = ordered.at(-1);
    return first && second ? { student, first, second, comparison: compareAssessments(first, second) } : null;
  }).filter(isDefined);
  const avgFatDelta = pairs.length ? pairs.reduce((sum, item) => sum + item.comparison.bodyFat, 0) / pairs.length : 0;
  const avgLeanDelta = pairs.length ? pairs.reduce((sum, item) => sum + item.comparison.leanMass, 0) / pairs.length : 0;
  const ranking = [...pairs].sort((a, b) => a.comparison.bodyFat - b.comparison.bodyFat).slice(0, 4);
  const staleStudents = students.filter((student) => {
    const latest = assessments.filter((item) => item.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latest) return true;
    const days = Math.floor((new Date(`${today}T00:00:00`).getTime() - new Date(`${latest.date}T00:00:00`).getTime()) / 86400000);
    return days >= 30;
  });
  const chart = pairs.map(({ student, first, second }) => {
    return {
      name: student.name.split(" ")[0],
      gorduraInicial: first.bodyFat,
      gorduraAtual: second.bodyFat,
      massaMagra: second.leanMass,
    };
  });

  return (
    <div className="grid gap-6">
      <section className="flex flex-col justify-between gap-4 rounded-md border bg-card p-5 md:flex-row md:items-center">
        <div>
          <Badge className="mb-3 bg-blue-600 text-white hover:bg-blue-600">SaaS fitness premium</Badge>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Dashboard do personal</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Acompanhe evolucao, gere avaliacoes e entregue relatorios comparativos com leitura profissional.
          </p>
        </div>
        <Button asChild size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
          <Link href="/dashboard/avaliacoes/nova">
            <Activity className="size-4" />
            Nova avaliacao
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total de alunos" value={String(students.length)} detail="ativos no workspace" icon={UsersRound} />
        <MetricCard title="Avaliacoes realizadas" value={String(assessments.length)} detail="incluindo dados demo" icon={Activity} />
        <MetricCard title="Evolucao media" value={`${avgFatDelta > 0 ? "+" : ""}${avgFatDelta.toFixed(1)} p.p.`} detail="gordura corporal" icon={ArrowDownRight} />
        <MetricCard title="Massa magra media" value={`+${avgLeanDelta.toFixed(1)} kg`} detail="ganho entre avaliacoes" icon={ArrowUpRight} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-500" />
              Evolucao comparativa
            </CardTitle>
            <CardDescription>Percentual de gordura e massa magra atual por aluno.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 min-w-0 overflow-x-auto">
            {chart.length ? (
              <AreaChart width={760} height={300} data={chart}>
              <defs>
                <linearGradient id="fat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lean" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Area type="monotone" dataKey="gorduraAtual" stroke="#ef4444" fill="url(#fat)" />
              <Area type="monotone" dataKey="massaMagra" stroke="#2563eb" fill="url(#lean)" />
              </AreaChart>
            ) : (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                Cadastre ao menos duas avaliacoes por aluno para visualizar evolucao.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="size-5 text-blue-500" />
              Ultimas avaliacoes
            </CardTitle>
            <CardDescription>Historico recente com acesso rapido ao relatorio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">% Gord.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.slice(-5).reverse().map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{students.find((student) => student.id === assessment.studentId)?.name}</TableCell>
                    <TableCell>{new Date(`${assessment.date}T00:00:00`).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="text-right font-mono">{assessment.bodyFat}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-blue-500" />
              Melhores evolucoes
            </CardTitle>
            <CardDescription>Alunos com maior queda de gordura entre os dois ultimos acompanhamentos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {ranking.length ? ranking.map((item) => (
              <div key={item.student.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-bold">{item.student.name}</p>
                  <p className="text-xs text-muted-foreground">{item.student.goal} | {item.student.weeklyFrequency}x/semana</p>
                </div>
                <Badge className="bg-emerald-600 text-white">{item.comparison.bodyFat.toFixed(1)} p.p.</Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground">Sem comparativos suficientes ainda.</p>}
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5 text-blue-500" />
              Reavaliacoes pendentes
            </CardTitle>
            <CardDescription>Alunos sem avaliacao recente ou ainda sem acompanhamento.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {staleStudents.length ? staleStudents.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-bold">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.goal}</p>
                </div>
                <Badge variant="outline" className="gap-1 text-orange-600">
                  <AlertTriangle className="size-3" />
                  revisar
                </Badge>
              </div>
            )) : <p className="text-sm text-muted-foreground">Todos os alunos tem acompanhamento recente.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function isDefined<T>(item: T | null): item is T {
  return item !== null;
}
