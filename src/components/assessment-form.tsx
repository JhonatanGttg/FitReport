"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Calculator, Save } from "lucide-react";
import { saveAssessmentAction } from "@/app/dashboard/avaliacoes/nova/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { calculateBmi, calculateComposition, measurementLabels, skinfoldLabels, sumSkinfolds } from "@/lib/calculations";
import type { Measurements, Skinfolds, Student } from "@/lib/types";

const initialMeasurements: Measurements = {
  shoulder: 104,
  leftArm: 30,
  rightArm: 30,
  waist: 78,
  abdomen: 85,
  hip: 100,
  leftThigh: 56,
  rightThigh: 56,
  leftLeg: 37,
  rightLeg: 37,
};

const initialSkinfolds: Skinfolds = {
  triceps: 18,
  subscapular: 20,
  chest: 14,
  midaxillary: 16,
  suprailiac: 18,
  abdominal: 22,
  thigh: 20,
};

export function AssessmentForm({ students }: { students: Student[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState(68);
  const [height, setHeight] = useState(students[0]?.height ?? 1.65);
  const [bodyFat, setBodyFat] = useState(27);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [skinfolds, setSkinfolds] = useState(initialSkinfolds);

  const bmi = useMemo(() => calculateBmi(weight, height), [weight, height]);
  const composition = useMemo(() => calculateComposition(weight, bodyFat), [weight, bodyFat]);
  const skinfoldTotal = useMemo(() => sumSkinfolds(skinfolds), [skinfolds]);
  const hasStudents = students.length > 0;
  const selectedStudent = students.find((student) => student.id === studentId);

  function submit({ redirectToReport }: { redirectToReport: boolean }) {
    if (!studentId) {
      toast.error("Cadastre um aluno antes de salvar uma avaliacao.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveAssessmentAction({
          studentId,
          date,
          weight,
          height,
          bodyFat,
          measurements,
          skinfolds,
        });

        toast.success("Avaliacao salva e sincronizada com o Supabase.");

        if (redirectToReport && result.previousAssessmentId) {
          router.push(`/dashboard/relatorios/comparativo?student=${result.studentId}&first=${result.previousAssessmentId}&second=${result.assessmentId}`);
          return;
        }

        router.push(`/dashboard/alunos/${result.studentId}`);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar a avaliacao.");
      }
    });
  }

  function handleStudentChange(nextStudentId: string) {
    setStudentId(nextStudentId);
    const student = students.find((item) => item.id === nextStudentId);
    if (student) {
      setHeight(student.height);
      setWeight(student.initialWeight);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Nova avaliacao fisica</h1>
        <p className="text-muted-foreground">Formulario sincronizado com Supabase, historico do aluno e relatorios comparativos.</p>
      </div>

      {!hasStudents ? (
        <Card className="rounded-md border-blue-500/20">
          <CardHeader>
            <CardTitle>Nenhum aluno cadastrado</CardTitle>
            <CardDescription>Cadastre um aluno antes de registrar a primeira avaliacao.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => router.push("/dashboard/alunos")}>Cadastrar aluno</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card className="rounded-md">
            <CardHeader>
              <CardTitle>Dados principais</CardTitle>
              <CardDescription>Selecione o aluno e registre a composicao corporal.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="grid gap-2 md:col-span-2">
                  <Label>Aluno</Label>
                  <Select value={studentId} onValueChange={(value) => value && handleStudentChange(value)}>
                    <SelectTrigger className="w-full" title={selectedStudent?.name ?? "Selecione um aluno"}>
                      <span className="truncate text-left">{selectedStudent?.name ?? "Selecione um aluno"}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <NumberField label="Peso (kg)" value={weight} setValue={setWeight} />
                <NumberField label="Altura (m)" value={height} setValue={setHeight} step="0.01" />
                <NumberField label="% gordura" value={bodyFat} setValue={setBodyFat} step="0.1" />
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="mb-3 font-bold">Perimetros</h2>
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                  {(Object.keys(measurementLabels) as Array<keyof Measurements>).map((key) => (
                    <NumberField
                      key={key}
                      label={`${measurementLabels[key]} (cm)`}
                      value={measurements[key]}
                      setValue={(value) => setMeasurements((current) => ({ ...current, [key]: value }))}
                      step="0.1"
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="mb-3 font-bold">Dobras cutaneas Pollock 7</h2>
                <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {(Object.keys(skinfoldLabels) as Array<keyof Skinfolds>).map((key) => (
                    <NumberField
                      key={key}
                      label={`${skinfoldLabels[key]} (mm)`}
                      value={skinfolds[key]}
                      setValue={(value) => setSkinfolds((current) => ({ ...current, [key]: value }))}
                      step="0.1"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <aside className="grid content-start gap-4">
            <Card className="rounded-md border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="size-5 text-blue-500" />
                  Calculos automaticos
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <AutoMetric label="IMC" value={bmi.toFixed(1)} />
                <AutoMetric label="Massa magra" value={`${composition.leanMass.toFixed(1)} kg`} />
                <AutoMetric label="Massa gorda" value={`${composition.fatMass.toFixed(1)} kg`} />
                <AutoMetric label="Soma 7 dobras" value={`${skinfoldTotal.toFixed(1)} mm`} />
                <Button type="button" disabled={isPending} onClick={() => submit({ redirectToReport: false })} className="mt-2 gap-2 bg-blue-600 text-white hover:bg-blue-700">
                  <Save className="size-4" />
                  {isPending ? "Salvando..." : "Salvar avaliacao"}
                </Button>
                <Button type="button" disabled={isPending} variant="outline" className="gap-2" onClick={() => submit({ redirectToReport: true })}>
                  Gerar relatorio
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  setValue,
  step = "1",
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  step?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type="number" value={Number.isFinite(value) ? value : 0} step={step} onChange={(event) => setValue(Number(event.target.value))} />
    </div>
  );
}

function AutoMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-lg font-black">{value}</span>
    </div>
  );
}
