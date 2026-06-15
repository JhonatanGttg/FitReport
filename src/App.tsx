import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Calculator,
  Dumbbell,
  Edit,
  FileText,
  Loader2,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportExportActions, type ReportPdfData, type ReportPdfRow } from "@/components/report-export-actions";
import { compareAssessments, generateProfessionalAnalysis, measurementLabels, skinfoldLabels, sumSkinfolds } from "@/lib/calculations";
import {
  deleteStudent,
  getSessionUser,
  loadAppData,
  resetPassword,
  saveAssessment,
  saveReport,
  saveStudent,
  saveTrainer,
  signIn,
  signOut,
  signUp,
} from "@/lib/supabase-data";
import { hasSupabaseEnv } from "@/lib/supabase/client";
import type { AppData, Assessment, Measurements, Report, Skinfolds, Student, Trainer } from "@/lib/types";

type View = "dashboard" | "students" | "assessment" | "reports" | "profile";
type AuthMode = "login" | "signup" | "reset";

const emptyMeasurements: Measurements = {
  shoulder: 0,
  leftArm: 0,
  rightArm: 0,
  waist: 0,
  abdomen: 0,
  hip: 0,
  leftThigh: 0,
  rightThigh: 0,
  leftLeg: 0,
  rightLeg: 0,
};

const emptySkinfolds: Skinfolds = {
  triceps: 0,
  subscapular: 0,
  chest: 0,
  midaxillary: 0,
  suprailiac: 0,
  abdominal: 0,
  thigh: 0,
};

export default function App() {
  const [sessionReady, setSessionReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AppData | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<{ student: Student; first: Assessment; second: Assessment; report?: Report | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    getSessionUser().then((user) => {
      setAuthenticated(Boolean(user));
      setSessionReady(true);
    });
  }, []);

  useEffect(() => {
    if (!sessionReady || !authenticated) return;
    refreshData();
  }, [sessionReady, authenticated]);

  async function refreshData() {
    setLoading(true);
    try {
      const next = await loadAppData();
      setData(next);
      setSelectedReport(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel carregar dados reais.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut();
    setAuthenticated(false);
    setData(null);
    setView("dashboard");
  }

  if (!hasSupabaseEnv()) {
    return (
      <>
        <EnvNotice />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  if (!sessionReady) {
    return <FullLoader label="Preparando sessao..." />;
  }

  if (!authenticated) {
    return (
      <>
        <AuthScreen onAuthenticated={() => setAuthenticated(true)} />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  if (loading || !data) {
    return <FullLoader label="Carregando dados reais do Supabase..." />;
  }

  const currentStudent = selectedStudentId ? data.students.find((student) => student.id === selectedStudentId) ?? null : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r bg-sidebar/80 p-5 backdrop-blur xl:block">
        <button className="flex items-center gap-3 text-left" onClick={() => setView("dashboard")}>
          <span className="flex size-11 items-center justify-center rounded-md bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Dumbbell className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight">FitReport Pro</span>
            <span className="text-xs text-muted-foreground">{data.trainer.name}</span>
          </span>
        </button>
        <nav className="mt-10 grid gap-2">
          <NavButton view="dashboard" current={view} icon={BarChart3} label="Dashboard" onClick={setView} />
          <NavButton view="students" current={view} icon={UsersRound} label="Alunos" onClick={setView} />
          <NavButton view="assessment" current={view} icon={Activity} label="Nova avaliacao" onClick={setView} />
          <NavButton view="reports" current={view} icon={FileText} label="Relatorios" onClick={setView} />
          <NavButton view="profile" current={view} icon={UserRoundCog} label="Perfil" onClick={setView} />
        </nav>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/88 px-4 backdrop-blur md:px-8">
          <button className="flex items-center gap-2 font-black xl:hidden" onClick={() => setView("dashboard")}>
            <Dumbbell className="size-5 text-blue-600" />
            FitReport Pro
          </button>
          <div className="hidden text-sm text-muted-foreground xl:block">Workspace de {data.trainer.name}</div>
          <div className="flex items-center gap-2">
            <Button type="button" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setView("assessment")}>
              <Activity className="size-4" />
              Nova avaliacao
            </Button>
            <Button type="button" variant="outline" size="icon" onClick={logout} title="Sair">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">
          {view === "dashboard" ? <Dashboard data={data} onView={setView} /> : null}
          {view === "students" ? (
            currentStudent ? (
              <StudentHistory
                student={currentStudent}
                assessments={data.assessments.filter((assessment) => assessment.studentId === currentStudent.id)}
                onBack={() => setSelectedStudentId("")}
                onReport={(payload) => {
                  setSelectedReport(payload);
                  setView("reports");
                }}
              />
            ) : (
              <StudentsPage data={data} onRefresh={refreshData} onOpenStudent={setSelectedStudentId} />
            )
          ) : null}
          {view === "assessment" ? <AssessmentPage data={data} onSaved={refreshData} onReport={(payload) => { setSelectedReport(payload); setView("reports"); }} /> : null}
          {view === "reports" ? <ReportsPage data={data} selected={selectedReport} onSelect={setSelectedReport} onRefresh={refreshData} /> : null}
          {view === "profile" ? <ProfilePage trainer={data.trainer} onRefresh={refreshData} /> : null}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setMessage("");
    setLoading(true);
    try {
      if (mode === "login") {
        setMessage("Validando acesso no Supabase...");
        await signIn(email, password);
        toast.success("Login realizado.");
        onAuthenticated();
      } else if (mode === "signup") {
        setMessage("Criando perfil profissional...");
        const hasSession = await signUp(name, email, password);
        toast.success(hasSession ? "Conta criada e sincronizada." : "Conta criada. Confirme seu e-mail antes de entrar.");
        if (hasSession) onAuthenticated();
        else setMode("login");
      } else {
        setMessage("Enviando link de recuperacao...");
        await resetPassword(email);
        toast.success("E-mail de recuperacao enviado.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nao foi possivel autenticar.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(37,99,235,0.38),transparent_28%),linear-gradient(135deg,#030712,#061841_52%,#020617)]" />
          <div className="absolute -right-24 top-20 h-96 w-96 rotate-12 border border-blue-400/20 bg-[repeating-linear-gradient(135deg,rgba(37,99,235,0.35)_0_4px,transparent_4px_14px)]" />
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-md bg-white text-[#030712]">
                <Dumbbell className="size-8" />
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight">FitReport Pro</p>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-200">Physical assessment studio</p>
              </div>
            </div>
            <div className="mt-20 max-w-2xl">
              <Badge className="mb-4 bg-blue-600 text-white">Relatorios fitness premium</Badge>
              <h1 className="text-6xl font-black uppercase leading-[0.95] tracking-tight">
                Sua marca no centro da evolucao do aluno.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Dados reais no Supabase, alunos isolados por personal e relatorios comparativos prontos para PDF.
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center p-4 sm:p-8">
          <Card className="w-full max-w-[480px] rounded-md border-white/10 bg-slate-950/70 text-white">
            <CardHeader>
              <Badge className="w-fit bg-blue-600/15 text-blue-200">{mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Comece seu workspace" : "Recuperacao segura"}</Badge>
              <CardTitle className="text-3xl font-black">{mode === "login" ? "Entre no seu centro de evolucao" : mode === "signup" ? "Crie seu perfil de personal" : "Redefina sua senha"}</CardTitle>
              <CardDescription className="text-slate-400">Acesso sincronizado com Supabase e banco real.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-4">
                {mode === "signup" ? <Field label="Nome do personal" name="name" required /> : null}
                <Field label="E-mail" name="email" type="email" required />
                {mode !== "reset" ? <Field label="Senha" name="password" type="password" minLength={6} required /> : null}
                {message ? <p className="rounded-md border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">{message}</p> : null}
                <Button type="submit" className="h-11 gap-2 bg-blue-600 text-white hover:bg-blue-500" disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                  {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
                </Button>
              </form>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <AuthModeButton active={mode === "login"} onClick={() => setMode("login")}>Login</AuthModeButton>
                <AuthModeButton active={mode === "signup"} onClick={() => setMode("signup")}>Cadastro</AuthModeButton>
                <AuthModeButton active={mode === "reset"} onClick={() => setMode("reset")}>Senha</AuthModeButton>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ data, onView }: { data: AppData; onView: (view: View) => void }) {
  const pairs = data.students
    .map((student) => {
      const ordered = data.assessments.filter((item) => item.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
      const first = ordered.at(-2);
      const second = ordered.at(-1);
      return first && second ? { student, comparison: compareAssessments(first, second) } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const avgFat = pairs.length ? pairs.reduce((sum, item) => sum + item.comparison.bodyFat, 0) / pairs.length : 0;
  const avgLean = pairs.length ? pairs.reduce((sum, item) => sum + item.comparison.leanMass, 0) / pairs.length : 0;
  const latest = [...data.assessments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="grid gap-6">
      <section className="flex flex-col justify-between gap-4 rounded-md border bg-card p-5 md:flex-row md:items-center">
        <div>
          <Badge className="mb-3 bg-blue-600 text-white">SaaS fitness premium</Badge>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Dashboard do personal</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Acompanhe evolucao real dos alunos e gere relatórios profissionais.</p>
        </div>
        <Button type="button" size="lg" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={() => onView("assessment")}>
          <Activity className="size-4" />
          Nova avaliacao
        </Button>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total de alunos" value={String(data.students.length)} detail="ativos no banco" icon={UsersRound} />
        <Metric title="Avaliacoes realizadas" value={String(data.assessments.length)} detail="sincronizadas" icon={Activity} />
        <Metric title="Evolucao media" value={`${avgFat > 0 ? "+" : ""}${avgFat.toFixed(1)} p.p.`} detail="gordura corporal" icon={BarChart3} />
        <Metric title="Massa magra media" value={`${avgLean > 0 ? "+" : ""}${avgLean.toFixed(1)} kg`} detail="entre acompanhamentos" icon={Dumbbell} />
      </section>
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Ultimas avaliacoes</CardTitle>
          <CardDescription>Registros reais mais recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          {latest.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead className="text-right">% gordura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latest.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{data.students.find((student) => student.id === assessment.studentId)?.name}</TableCell>
                    <TableCell>{formatDate(assessment.date)}</TableCell>
                    <TableCell>{assessment.weight.toFixed(1)} kg</TableCell>
                    <TableCell className="text-right">{assessment.bodyFat.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Nenhuma avaliacao ainda" description="Cadastre alunos e registre a primeira avaliacao fisica." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsPage({ data, onRefresh, onOpenStudent }: { data: AppData; onRefresh: () => Promise<void>; onOpenStudent: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const filtered = data.students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">Base real sincronizada com Supabase.</p>
        </div>
        <Button type="button" className="gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={() => setEditing(createEmptyStudent(data.trainer.id))}>
          <Plus className="size-4" />
          Novo aluno
        </Button>
      </div>
      {editing ? <StudentEditor student={editing} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await onRefresh(); }} /> : null}
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Base de alunos</CardTitle>
          <CardDescription>Dados fisicos, objetivo e atalhos de acompanhamento.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Buscar aluno" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          {filtered.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Altura</TableHead>
                  <TableHead>Peso inicial</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.sex}, {student.age} anos</p>
                    </TableCell>
                    <TableCell>{student.goal}</TableCell>
                    <TableCell>{student.height} m</TableCell>
                    <TableCell>{student.initialWeight} kg</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="ghost" size="sm" onClick={() => onOpenStudent(student.id)}>Historico</Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setEditing(student)}><Edit className="size-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" onClick={async () => { await deleteStudent(student.id); await onRefresh(); toast.success("Aluno removido."); }}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Nenhum aluno cadastrado" description="Crie o primeiro aluno para iniciar os acompanhamentos." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentEditor({ student, onClose, onSaved }: { student: Student; onClose: () => void; onSaved: () => Promise<void> }) {
  const [form, setForm] = useState(student);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveStudent(form);
      toast.success("Aluno salvo no Supabase.");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-md border-blue-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{form.id ? "Editar aluno" : "Novo aluno"}</CardTitle>
          <CardDescription>Preencha dados reais do aluno.</CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={onClose}>Fechar</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <ControlledField label="Nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
          <SelectField label="Sexo" value={form.sex} options={["Feminino", "Masculino", "Outro"]} onChange={(value) => setForm({ ...form, sex: value as Student["sex"] })} />
          <ControlledField label="Idade" type="number" value={String(form.age || "")} onChange={(value) => setForm({ ...form, age: Number(value) })} required />
          <ControlledField label="Nascimento" type="date" value={form.birthDate} onChange={(value) => setForm({ ...form, birthDate: value })} required />
          <ControlledField label="Altura (m)" type="number" step="0.01" value={String(form.height || "")} onChange={(value) => setForm({ ...form, height: Number(value) })} required />
          <ControlledField label="Peso inicial (kg)" type="number" step="0.1" value={String(form.initialWeight || "")} onChange={(value) => setForm({ ...form, initialWeight: Number(value) })} required />
          <SelectField label="Objetivo" value={form.goal} options={["Emagrecimento", "Hipertrofia", "Recomposicao corporal", "Saude", "Performance"]} onChange={(value) => setForm({ ...form, goal: value as Student["goal"] })} />
          <SelectField label="Nivel" value={form.trainingLevel} options={["Iniciante", "Intermediario", "Avancado"]} onChange={(value) => setForm({ ...form, trainingLevel: value as Student["trainingLevel"] })} />
          <ControlledField label="Frequencia semanal" type="number" value={String(form.weeklyFrequency || "")} onChange={(value) => setForm({ ...form, weeklyFrequency: Number(value) })} />
          <ControlledField label="Foto URL" value={form.photoUrl} onChange={(value) => setForm({ ...form, photoUrl: value })} />
          <div className="grid gap-2 md:col-span-2">
            <Label>Observacoes</Label>
            <Textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Restricoes</Label>
            <Textarea value={form.restrictions} onChange={(event) => setForm({ ...form, restrictions: event.target.value })} />
          </div>
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 md:col-span-2" disabled={saving}>
            {saving ? "Salvando..." : "Salvar aluno"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AssessmentPage({ data, onSaved, onReport }: { data: AppData; onSaved: () => Promise<void>; onReport: (payload: { student: Student; first: Assessment; second: Assessment }) => void }) {
  const [studentId, setStudentId] = useState("");
  const selectedStudent = data.students.find((student) => student.id === studentId) ?? null;
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [measurements, setMeasurements] = useState<Measurements>(emptyMeasurements);
  const [skinfolds, setSkinfolds] = useState<Skinfolds>(emptySkinfolds);
  const [saving, setSaving] = useState(false);
  const bmi = Number(weight) && Number(height) ? Number((Number(weight) / (Number(height) * Number(height))).toFixed(1)) : 0;
  const leanMass = Number(weight) && Number(bodyFat) ? Number((Number(weight) - Number(weight) * (Number(bodyFat) / 100)).toFixed(1)) : 0;
  const fatMass = Number(weight) && Number(bodyFat) ? Number((Number(weight) * (Number(bodyFat) / 100)).toFixed(1)) : 0;
  const skinfoldTotal = sumSkinfolds(skinfolds);

  function chooseStudent(nextId: string) {
    setStudentId(nextId);
    const student = data.students.find((item) => item.id === nextId);
    setHeight(student?.height ? String(student.height) : "");
    setWeight("");
  }

  async function submit(redirectReport: boolean) {
    if (!selectedStudent) return toast.error("Selecione um aluno.");
    setSaving(true);
    try {
      const assessment = await saveAssessment({
        trainerId: data.trainer.id,
        studentId: selectedStudent.id,
        date,
        weight: Number(weight),
        height: Number(height),
        bodyFat: Number(bodyFat),
        measurements,
        skinfolds,
      });
      const previous = data.assessments.filter((item) => item.studentId === selectedStudent.id).sort((a, b) => b.date.localeCompare(a.date))[0];
      await onSaved();
      toast.success("Avaliacao salva no Supabase.");
      if (redirectReport && previous) onReport({ student: selectedStudent, first: previous, second: assessment });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar avaliacao.");
    } finally {
      setSaving(false);
    }
  }

  if (!data.students.length) {
    return <EmptyState title="Nenhum aluno cadastrado" description="Cadastre um aluno antes de registrar avaliações." />;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Nova avaliacao fisica</h1>
        <p className="text-muted-foreground">Formulario sincronizado diretamente com Supabase.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle>Dados principais</CardTitle>
            <CardDescription>Preencha com medidas reais coletadas na avaliação.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              <SelectField label="Aluno" value={studentId} placeholder="Selecione" options={data.students.map((student) => student.id)} optionLabel={(id) => data.students.find((student) => student.id === id)?.name ?? id} onChange={chooseStudent} className="md:col-span-2" />
              <ControlledField label="Peso (kg)" type="number" step="0.1" value={weight} onChange={setWeight} required />
              <ControlledField label="Altura (m)" type="number" step="0.01" value={height} onChange={setHeight} required />
              <ControlledField label="% gordura" type="number" step="0.1" value={bodyFat} onChange={setBodyFat} required />
              <ControlledField label="Data" type="date" value={date} onChange={setDate} required />
            </div>
            <MeasurementGrid title="Perimetros" labels={measurementLabels} values={measurements} onChange={setMeasurements} unit="cm" />
            <MeasurementGrid title="Dobras cutaneas Pollock 7" labels={skinfoldLabels} values={skinfolds} onChange={setSkinfolds} unit="mm" />
          </CardContent>
        </Card>
        <Card className="h-fit rounded-md border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="size-5 text-blue-500" /> Calculos automaticos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <AutoMetric label="IMC" value={bmi.toFixed(1)} />
            <AutoMetric label="Massa magra" value={`${leanMass.toFixed(1)} kg`} />
            <AutoMetric label="Massa gorda" value={`${fatMass.toFixed(1)} kg`} />
            <AutoMetric label="Soma 7 dobras" value={`${skinfoldTotal.toFixed(1)} mm`} />
            <Button type="button" disabled={saving} onClick={() => submit(false)} className="mt-2 gap-2 bg-blue-600 text-white hover:bg-blue-700"><Save className="size-4" /> Salvar avaliacao</Button>
            <Button type="button" disabled={saving} onClick={() => submit(true)} variant="outline" className="gap-2">Gerar relatorio <ArrowRight className="size-4" /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StudentHistory({ student, assessments, onBack, onReport }: { student: Student; assessments: Assessment[]; onBack: () => void; onReport: (payload: { student: Student; first: Assessment; second: Assessment }) => void }) {
  const ordered = [...assessments].sort((a, b) => a.date.localeCompare(b.date));
  const first = ordered.at(-2);
  const second = ordered.at(-1);
  const comparison = first && second ? compareAssessments(first, second) : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">{student.name}</h1>
          <p className="text-muted-foreground">{student.goal} | {student.weeklyFrequency} treino(s)/semana</p>
        </div>
        <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        <Metric title="Avaliacoes" value={String(ordered.length)} detail="registros" icon={Activity} />
        <Metric title="Peso atual" value={`${second?.weight.toFixed(1) ?? "-"} kg`} detail={`inicial ${student.initialWeight} kg`} icon={UserRound} />
        <Metric title="Gordura" value={`${second?.bodyFat.toFixed(1) ?? "-"}%`} detail={comparison ? `${signed(comparison.bodyFat)} p.p.` : "sem comparativo"} icon={BarChart3} />
        <Metric title="Massa magra" value={`${second?.leanMass.toFixed(1) ?? "-"} kg`} detail={comparison ? `${signed(comparison.leanMass)} kg` : "sem comparativo"} icon={Dumbbell} />
      </section>
      <Card className="rounded-md">
        <CardHeader>
          <CardTitle>Historico de avaliacoes</CardTitle>
          <CardDescription>Linha do tempo com dados reais.</CardDescription>
        </CardHeader>
        <CardContent>
          {ordered.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>IMC</TableHead>
                  <TableHead>% gordura</TableHead>
                  <TableHead>Massa magra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordered.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>{formatDate(assessment.date)}</TableCell>
                    <TableCell>{assessment.weight.toFixed(1)} kg</TableCell>
                    <TableCell>{assessment.bmi.toFixed(1)}</TableCell>
                    <TableCell>{assessment.bodyFat.toFixed(1)}%</TableCell>
                    <TableCell>{assessment.leanMass.toFixed(1)} kg</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <EmptyState title="Sem avaliações" description="Registre a primeira avaliação deste aluno." />}
          {first && second ? <Button type="button" className="mt-4 bg-blue-600 text-white hover:bg-blue-700" onClick={() => onReport({ student, first, second })}>Comparar ultimos</Button> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function ReportsPage({ data, selected, onSelect, onRefresh }: { data: AppData; selected: { student: Student; first: Assessment; second: Assessment; report?: Report | null } | null; onSelect: (payload: { student: Student; first: Assessment; second: Assessment; report?: Report | null } | null) => void; onRefresh: () => Promise<void> }) {
  if (selected) {
    return <ReportView data={data} payload={selected} onBack={() => onSelect(null)} onRefresh={onRefresh} />;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Relatorios</h1>
        <p className="text-muted-foreground">Gere comparativos a partir das avaliações reais.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {data.students.map((student) => {
          const ordered = data.assessments.filter((item) => item.studentId === student.id).sort((a, b) => a.date.localeCompare(b.date));
          const first = ordered.at(-2);
          const second = ordered.at(-1);
          return (
            <Card key={student.id} className="rounded-md">
              <CardHeader>
                <CardTitle>{student.name}</CardTitle>
                <CardDescription>{ordered.length} acompanhamentos registrados</CardDescription>
              </CardHeader>
              <CardContent>
                {first && second ? (
                  <Button type="button" className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={() => onSelect({ student, first, second })}>Comparar ultimos</Button>
                ) : <p className="text-sm text-muted-foreground">Precisa de pelo menos 2 avaliações.</p>}
              </CardContent>
            </Card>
          );
        })}
        {data.reports.map((report) => {
          const student = data.students.find((item) => item.id === report.studentId);
          const first = data.assessments.find((item) => item.id === report.firstAssessmentId);
          const second = data.assessments.find((item) => item.id === report.secondAssessmentId);
          if (!student || !first || !second) return null;
          return (
            <Card key={report.id} className="rounded-md border-blue-500/20">
              <CardHeader>
                <CardTitle>{student.name}</CardTitle>
                <CardDescription>Relatorio salvo em {formatDate(report.createdAt.slice(0, 10))}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{report.professionalAnalysis}</p>
                <Button type="button" className="w-full" variant="outline" onClick={() => onSelect({ student, first, second, report })}>Abrir salvo</Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function ReportView({ data, payload, onBack, onRefresh }: { data: AppData; payload: { student: Student; first: Assessment; second: Assessment; report?: Report | null }; onBack: () => void; onRefresh: () => Promise<void> }) {
  const comparison = compareAssessments(payload.first, payload.second);
  const auto = generateProfessionalAnalysis(payload.student, payload.first, payload.second);
  const [analysis, setAnalysis] = useState(payload.report?.professionalAnalysis ?? auto.analysis);
  const [recommendations, setRecommendations] = useState((payload.report?.recommendations.length ? payload.report.recommendations : auto.recommendations).join("\n"));
  const recs = recommendations.split("\n").map((item) => item.trim()).filter(Boolean);
  const metrics = [
    { title: "Peso", first: `${payload.first.weight.toFixed(1)} kg`, second: `${payload.second.weight.toFixed(1)} kg`, delta: signed(comparison.weight, "kg"), good: comparison.weight <= 0, direction: directionFrom(comparison.weight) },
    { title: "IMC", first: payload.first.bmi.toFixed(1), second: payload.second.bmi.toFixed(1), delta: signed(comparison.bmi), good: comparison.bmi <= 0, direction: directionFrom(comparison.bmi) },
    { title: "% Gordura", first: `${payload.first.bodyFat.toFixed(1)}%`, second: `${payload.second.bodyFat.toFixed(1)}%`, delta: signed(comparison.bodyFat, "p.p."), good: comparison.bodyFat <= 0, direction: directionFrom(comparison.bodyFat) },
    { title: "Massa magra", first: `${payload.first.leanMass.toFixed(1)} kg`, second: `${payload.second.leanMass.toFixed(1)} kg`, delta: signed(comparison.leanMass, "kg"), good: comparison.leanMass >= 0, direction: directionFrom(comparison.leanMass) },
  ];
  const perimeterRows = comparison.perimeterRows.map((row) => ({ label: row.label, first: `${row.first} cm`, second: `${row.second} cm`, delta: signed(row.delta, "cm"), good: row.trend === "improved", direction: directionFrom(row.delta) }));
  const skinfoldRows = [
    ...comparison.skinfoldRows.map((row) => ({ label: row.label, first: `${row.first} mm`, second: `${row.second} mm`, delta: signed(row.delta, "mm"), good: row.trend === "improved", direction: directionFrom(row.delta) })),
    { label: "Soma das 7 dobras", first: `${sumSkinfolds(payload.first.skinfolds)} mm`, second: `${sumSkinfolds(payload.second.skinfolds)} mm`, delta: signed(comparison.skinfoldSum, "mm"), good: comparison.skinfoldSum <= 0, direction: directionFrom(comparison.skinfoldSum) },
  ];
  const compositionRows = metrics.map((metric) => ({ ...metric, label: metric.title }));
  const pdfData: ReportPdfData = {
    trainerName: data.trainer.name,
    trainerInstagram: data.trainer.instagram,
    trainerWhatsapp: data.trainer.whatsapp,
    signature: data.trainer.reportSignature,
    phrase: data.trainer.motivationalPhrase,
    studentName: payload.student.name,
    studentMeta: `${payload.student.sex}, ${payload.student.age} anos`,
    height: `${Math.round(payload.student.height * 100)} cm`,
    firstDate: formatDate(payload.first.date),
    secondDate: formatDate(payload.second.date),
    metrics,
    perimeterRows,
    skinfoldRows,
    compositionRows,
    improved: auto.improved,
    worsened: auto.worsened,
    needs: auto.needs,
    recommendations: recs,
    analysis,
  };

  async function persist() {
    try {
      await saveReport({
        trainerId: data.trainer.id,
        studentId: payload.student.id,
        firstAssessmentId: payload.first.id,
        secondAssessmentId: payload.second.id,
        professionalAnalysis: analysis,
        recommendations: recs,
        improved: auto.improved,
        worsened: auto.worsened,
        needs: auto.needs,
      });
      toast.success("Relatorio salvo no Supabase.");
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar relatorio.");
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Relatorio comparativo</h1>
          <p className="text-muted-foreground">{payload.student.name} | {formatDate(payload.first.date)} x {formatDate(payload.second.date)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>Voltar</Button>
          <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700" onClick={persist}>Salvar relatorio</Button>
          <ReportExportActions targetId="fitness-report" message={`Relatorio de ${payload.student.name}`} reportData={pdfData} />
        </div>
      </div>
      <Card className="rounded-md border-blue-500/20">
        <CardHeader>
          <CardTitle>Ajustes do personal</CardTitle>
          <CardDescription>A análise nasce das regras fixas e pode ser editada antes do PDF.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Analise profissional</Label>
            <Textarea className="min-h-36" value={analysis} onChange={(event) => setAnalysis(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Recomendacoes</Label>
            <Textarea className="min-h-36" value={recommendations} onChange={(event) => setRecommendations(event.target.value)} />
          </div>
        </CardContent>
      </Card>
      <section id="fitness-report" className="overflow-hidden rounded-md border bg-white text-slate-950 shadow-2xl">
        <div className="bg-[#030712] p-6 text-white">
          <h2 className="text-3xl font-black uppercase">Relatorio comparativo <span className="text-blue-500">avaliacao fisica</span></h2>
          <p className="mt-2 text-sm text-white/70">{data.trainer.name} | {payload.student.name}</p>
        </div>
        <div className="grid gap-4 p-6">
          <div className="grid gap-3 md:grid-cols-4">
            {metrics.map((metric) => <MetricCardReport key={metric.title} {...metric} />)}
          </div>
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4">
              <SimpleReportTable title="Comparativo de perimetria" rows={perimeterRows} />
              <SimpleReportTable title="Comparativo das dobras cutaneas" rows={skinfoldRows} />
              <div>
                <h3 className="text-lg font-black uppercase">Analise profissional</h3>
                <p className="mt-2 rounded-md border bg-slate-50 p-4 text-sm font-medium leading-6">{analysis}</p>
              </div>
            </div>
            <div className="grid content-start gap-4">
              <Insight title="O que melhorou" items={auto.improved} tone="good" />
              <Insight title="O que piorou" items={auto.worsened} tone="bad" />
              <Insight title="Precisa melhorar" items={auto.needs} tone="warn" />
              <Insight title="Recomendacoes" items={recs} tone="brand" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfilePage({ trainer, onRefresh }: { trainer: Trainer; onRefresh: () => Promise<void> }) {
  const [form, setForm] = useState(trainer);
  const [saving, setSaving] = useState(false);
  async function persist() {
    setSaving(true);
    try {
      await saveTrainer(form);
      toast.success("Perfil salvo no Supabase.");
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nao foi possivel salvar perfil.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Perfil do personal</h1>
        <p className="text-muted-foreground">Identidade usada nos relatorios.</p>
      </div>
      <Card className="rounded-md">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <ControlledField label="Nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
          <ControlledField label="Instagram" value={form.instagram} onChange={(value) => setForm({ ...form, instagram: value })} />
          <ControlledField label="WhatsApp" value={form.whatsapp} onChange={(value) => setForm({ ...form, whatsapp: value })} />
          <ControlledField label="Logo URL" value={form.logoUrl} onChange={(value) => setForm({ ...form, logoUrl: value })} />
          <ControlledField label="Cor primaria" type="color" value={form.brandPrimary} onChange={(value) => setForm({ ...form, brandPrimary: value })} />
          <ControlledField label="Cor secundaria" type="color" value={form.brandSecondary} onChange={(value) => setForm({ ...form, brandSecondary: value })} />
          <div className="grid gap-2 md:col-span-2"><Label>Frase motivacional</Label><Textarea value={form.motivationalPhrase} onChange={(event) => setForm({ ...form, motivationalPhrase: event.target.value })} /></div>
          <div className="grid gap-2 md:col-span-2"><Label>Assinatura no relatorio</Label><Textarea value={form.reportSignature} onChange={(event) => setForm({ ...form, reportSignature: event.target.value })} /></div>
          <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700 md:col-span-2" disabled={saving} onClick={persist}>Salvar perfil</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NavButton({ view, current, icon: Icon, label, onClick }: { view: View; current: View; icon: typeof BarChart3; label: string; onClick: (view: View) => void }) {
  return (
    <Button type="button" variant={view === current ? "secondary" : "ghost"} className="h-11 justify-start gap-3 rounded-md" onClick={() => onClick(view)}>
      <Icon className="size-4" />
      {label}
    </Button>
  );
}

function Field(props: React.ComponentProps<"input"> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return <div className="grid gap-2"><Label>{label}</Label><Input {...inputProps} className="h-11" /></div>;
}

type ControlledFieldProps = Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function ControlledField({ label, value, onChange, className, ...props }: ControlledFieldProps) {
  return <div className={`grid gap-2 ${className ?? ""}`}><Label>{label}</Label><Input {...props} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SelectField({ label, value, options, onChange, optionLabel, placeholder, className }: { label: string; value: string; options: string[]; onChange: (value: string) => void; optionLabel?: (value: string) => string; placeholder?: string; className?: string }) {
  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      <Label>{label}</Label>
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => <option key={option} value={option}>{optionLabel ? optionLabel(option) : option}</option>)}
      </select>
    </div>
  );
}

function MeasurementGrid<T extends Measurements | Skinfolds>({ title, labels, values, onChange, unit }: { title: string; labels: Record<keyof T, string>; values: T; onChange: (values: T) => void; unit: string }) {
  return (
    <div>
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {(Object.keys(labels) as Array<keyof T>).map((key) => (
          <ControlledField
            key={String(key)}
            label={`${labels[key]} (${unit})`}
            type="number"
            step="0.1"
            value={String(values[key] || "")}
            onChange={(value) => onChange({ ...values, [key]: Number(value) } as T)}
          />
        ))}
      </div>
    </div>
  );
}

function Metric({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof UsersRound }) {
  return <Card className="rounded-md"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="text-xs text-muted-foreground">{detail}</p></div><span className="grid size-11 place-items-center rounded-md bg-blue-600/10 text-blue-500"><Icon className="size-5" /></span></CardContent></Card>;
}

function AutoMetric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3"><span className="text-sm text-muted-foreground">{label}</span><span className="font-mono text-lg font-black">{value}</span></div>;
}

function AuthModeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={active ? "rounded-md bg-blue-600 px-3 py-2 font-bold text-white" : "rounded-md bg-white/5 px-3 py-2 text-slate-300 hover:bg-white/10"}>{children}</button>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="grid place-items-center rounded-md border border-dashed p-8 text-center"><p className="font-bold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}

function FullLoader({ label }: { label: string }) {
  return <main className="grid min-h-screen place-items-center bg-background text-foreground"><div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin text-blue-500" />{label}</div></main>;
}

function EnvNotice() {
  return <main className="grid min-h-screen place-items-center bg-background p-4"><Card className="max-w-xl rounded-md"><CardHeader><CardTitle>Supabase nao configurado</CardTitle><CardDescription>Configure as variáveis do Vite no Vercel.</CardDescription></CardHeader><CardContent><pre className="rounded-md border bg-muted p-3 text-xs">{`VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY`}</pre></CardContent></Card></main>;
}

function MetricCardReport({ title, first, second, delta, good }: { title: string; first: string; second: string; delta: string; good: boolean }) {
  return <div className="rounded-md border border-blue-200 bg-white p-3"><p className="text-xs font-black uppercase">{title}</p><p className="mt-1 text-sm font-semibold text-slate-700">{first} -&gt; {second}</p><Badge className={good ? "mt-2 bg-emerald-600 text-white" : "mt-2 bg-red-600 text-white"}>{delta}</Badge></div>;
}

function SimpleReportTable({ title, rows }: { title: string; rows: ReportPdfRow[] }) {
  return <div><h3 className="text-lg font-black uppercase">{title}</h3><table className="mt-2 w-full border-collapse text-sm"><thead><tr className="bg-[#061841] text-white"><th className="p-2 text-left">Regiao</th><th className="p-2 text-left">1a</th><th className="p-2 text-left">2a</th><th className="p-2 text-left">Dif.</th></tr></thead><tbody>{rows.map((row) => <tr key={row.label} className="border-b"><td className="p-2">{row.label}</td><td className="p-2">{row.first}</td><td className="p-2">{row.second}</td><td className={row.good ? "p-2 font-bold text-emerald-700" : "p-2 font-bold text-red-600"}>{row.delta}</td></tr>)}</tbody></table></div>;
}

function Insight({ title, items, tone }: { title: string; items: string[]; tone: "good" | "bad" | "warn" | "brand" }) {
  const color = tone === "good" ? "text-emerald-700 border-emerald-300 bg-emerald-50" : tone === "bad" ? "text-red-700 border-red-300 bg-red-50" : tone === "warn" ? "text-orange-700 border-orange-300 bg-orange-50" : "text-blue-800 border-blue-300 bg-blue-50";
  return <div className={`rounded-md border p-3 ${color}`}><h3 className="font-black uppercase">{title}</h3><ul className="mt-2 list-disc pl-5 text-sm text-slate-900">{(items.length ? items : ["Sem alertas relevantes."]).map((item) => <li key={item}>{item}</li>)}</ul></div>;
}

function createEmptyStudent(trainerId: string): Student {
  return { id: "", trainerId, name: "", sex: "Feminino", age: 0, birthDate: "", height: 0, initialWeight: 0, photoUrl: "", progressFrontUrl: "", progressSideUrl: "", progressBackUrl: "", goal: "Recomposicao corporal", trainingLevel: "Intermediario", weeklyFrequency: 0, restrictions: "", clinicalNotes: "", notes: "" };
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
}

function signed(value: number, unit = "") {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

function directionFrom(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}
