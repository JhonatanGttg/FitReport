"use client";

import Link from "next/link";
import { Activity, ArrowDownRight, ArrowUpRight, Scale, TrendingUp, UsersRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricCard } from "@/components/metric-card";
import { compareAssessments } from "@/lib/calculations";
import { demoData } from "@/lib/demo-data";
import type { AppData } from "@/lib/types";

export function DashboardOverview({ data = demoData }: { data?: AppData }) {
  const { students, assessments } = data;
  const comparisons = students.map((student) => {
    const studentAssessments = assessments.filter((item) => item.studentId === student.id);
    return compareAssessments(studentAssessments[0], studentAssessments[1]);
  });
  const avgFatDelta = comparisons.reduce((sum, item) => sum + item.bodyFat, 0) / comparisons.length;
  const avgLeanDelta = comparisons.reduce((sum, item) => sum + item.leanMass, 0) / comparisons.length;
  const chart = students.map((student) => {
    const [first, second] = assessments.filter((item) => item.studentId === student.id);
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
        <MetricCard title="Evolucao media" value={`${avgFatDelta.toFixed(1)} p.p.`} detail="gordura corporal" icon={ArrowDownRight} />
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
    </div>
  );
}
