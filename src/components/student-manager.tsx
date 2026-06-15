"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Edit, FileClock, ImagePlus, Plus, Search, Target, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deleteStudentAction, saveStudentAction } from "@/app/dashboard/alunos/actions";
import { demoData } from "@/lib/demo-data";
import type { Sex, Student } from "@/lib/types";

const emptyStudent: Student = {
  id: "",
  trainerId: "trainer-demo",
  name: "",
  sex: "Feminino",
  age: 30,
  birthDate: "1996-01-01",
  height: 1.7,
  initialWeight: 70,
  photoUrl: "",
  progressFrontUrl: "",
  progressSideUrl: "",
  progressBackUrl: "",
  goal: "Recomposicao corporal",
  trainingLevel: "Intermediario",
  weeklyFrequency: 3,
  restrictions: "",
  clinicalNotes: "",
  notes: "",
};

export function StudentManager({ initialStudents = demoData.students }: { initialStudents?: Student[] }) {
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase())),
    [query, students],
  );

  function save(formData: FormData) {
    const fallbackStudent: Student = {
      id: editing?.id || `student-${Date.now()}`,
      trainerId: "trainer-demo",
      name: String(formData.get("name")),
      sex: String(formData.get("sex")) as Sex,
      age: Number(formData.get("age")),
      birthDate: String(formData.get("birthDate")),
      height: Number(formData.get("height")),
      initialWeight: Number(formData.get("initialWeight")),
      photoUrl: String(formData.get("photoUrl")),
      progressFrontUrl: String(formData.get("progressFrontUrl")),
      progressSideUrl: String(formData.get("progressSideUrl")),
      progressBackUrl: String(formData.get("progressBackUrl")),
      goal: String(formData.get("goal")) as Student["goal"],
      trainingLevel: String(formData.get("trainingLevel")) as Student["trainingLevel"],
      weeklyFrequency: Number(formData.get("weeklyFrequency")),
      restrictions: String(formData.get("restrictions")),
      clinicalNotes: String(formData.get("clinicalNotes")),
      notes: String(formData.get("notes")),
    };

    startTransition(async () => {
      try {
        const saved = await saveStudentAction(formData);
        const student = saved ?? fallbackStudent;
        setStudents((current) => (editing?.id ? current.map((item) => (item.id === editing.id ? student : item)) : [student, ...current]));
        setEditing(null);
        toast.success(saved ? "Aluno salvo no Supabase." : "Aluno salvo no workspace local.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar o aluno.");
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      try {
        await deleteStudentAction(id);
        setStudents((current) => current.filter((student) => student.id !== id));
        toast.success("Aluno removido do Supabase.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel remover o aluno.");
      }
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">CRUD completo com historico de avaliacoes por aluno.</p>
        </div>
        <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
            <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700" disabled={isPending} onClick={() => setEditing(emptyStudent)}>
            <Plus className="size-4" />
            Novo aluno
          </Button>
          <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Editar aluno" : "Novo aluno"}</DialogTitle>
            </DialogHeader>
            {editing ? <StudentForm student={editing} onSubmit={save} /> : null}
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Base de alunos</CardTitle>
          <CardDescription>Dados fisicos, foto, observacoes e atalhos de acompanhamento.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar aluno" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Altura</TableHead>
                <TableHead>Peso inicial</TableHead>
                <TableHead>Objetivo</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-md bg-blue-600/10 text-blue-500">
                        <UserRound className="size-4" />
                      </span>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.notes}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.sex}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.height} m</TableCell>
                  <TableCell>{student.initialWeight} kg</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold">
                      <Target className="size-3 text-blue-500" />
                      {student.goal}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" title="Historico">
                      <Link href={`/dashboard/alunos/${student.id}`}>
                        <FileClock className="size-4 text-blue-500" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => setEditing(student)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir" disabled={isPending} onClick={() => remove(student.id)}>
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentForm({ student, onSubmit }: { student: Student; onSubmit: (formData: FormData) => void }) {
  return (
    <form action={onSubmit} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="id" value={student.id} />
      <Field label="Nome" name="name" defaultValue={student.name} />
      <div className="grid gap-2">
        <Label>Sexo</Label>
        <Select name="sex" defaultValue={student.sex}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Feminino">Feminino</SelectItem>
            <SelectItem value="Masculino">Masculino</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Field label="Idade" name="age" type="number" defaultValue={student.age} />
      <Field label="Nascimento" name="birthDate" type="date" defaultValue={student.birthDate} />
      <Field label="Altura (m)" name="height" type="number" step="0.01" defaultValue={student.height} />
      <Field label="Peso inicial (kg)" name="initialWeight" type="number" step="0.1" defaultValue={student.initialWeight} />
      <div className="grid gap-2">
        <Label>Objetivo</Label>
        <Select name="goal" defaultValue={student.goal}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Emagrecimento">Emagrecimento</SelectItem>
            <SelectItem value="Hipertrofia">Hipertrofia</SelectItem>
            <SelectItem value="Recomposicao corporal">Recomposicao corporal</SelectItem>
            <SelectItem value="Saude">Saude</SelectItem>
            <SelectItem value="Performance">Performance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Nivel de treino</Label>
        <Select name="trainingLevel" defaultValue={student.trainingLevel}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Iniciante">Iniciante</SelectItem>
            <SelectItem value="Intermediario">Intermediario</SelectItem>
            <SelectItem value="Avancado">Avancado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Field label="Frequencia semanal" name="weeklyFrequency" type="number" min={0} max={14} defaultValue={student.weeklyFrequency} />
      <div className="grid gap-2 md:col-span-2">
        <Label>Foto URL</Label>
        <Input name="photoUrl" defaultValue={student.photoUrl} />
      </div>
      <div className="rounded-md border border-blue-500/20 p-3 md:col-span-2">
        <p className="mb-3 flex items-center gap-2 text-sm font-bold">
          <ImagePlus className="size-4 text-blue-500" />
          Fotos de progresso
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Frente URL" name="progressFrontUrl" defaultValue={student.progressFrontUrl} required={false} />
          <Field label="Lado URL" name="progressSideUrl" defaultValue={student.progressSideUrl} required={false} />
          <Field label="Costas URL" name="progressBackUrl" defaultValue={student.progressBackUrl} required={false} />
        </div>
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label>Restricoes</Label>
        <Textarea name="restrictions" defaultValue={student.restrictions} />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label>Observacoes clinicas</Label>
        <Textarea name="clinicalNotes" defaultValue={student.clinicalNotes} />
      </div>
      <div className="grid gap-2 md:col-span-2">
        <Label>Observacoes</Label>
        <Textarea name="notes" defaultValue={student.notes} />
      </div>
      <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 md:col-span-2">Salvar aluno</Button>
    </form>
  );
}

function Field(props: React.ComponentProps<"input"> & { label: string; name: string }) {
  const { label, required = true, ...inputProps } = props;
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input {...inputProps} required={required} />
    </div>
  );
}
