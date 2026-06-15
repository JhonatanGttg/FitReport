import { notFound } from "next/navigation";
import { asc, count, eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { getDb } from "@/db/client";
import { assessments, reports, students, trainers, users } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getAuthenticatedUser();
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!user || !admins.includes(user.email?.toLowerCase() ?? "")) notFound();

  const db = getDb();
  const rows = await db.select({
    id: trainers.id,
    name: trainers.name,
    email: users.email,
    plan: trainers.plan,
    status: trainers.subscriptionStatus,
    studentsCount: count(students.id),
  })
    .from(trainers)
    .innerJoin(users, eq(users.id, trainers.userId))
    .leftJoin(students, eq(students.trainerId, trainers.id))
    .groupBy(trainers.id, users.email)
    .orderBy(asc(trainers.name));

  const [assessmentCount] = await db.select({ value: count() }).from(assessments);
  const [reportCount] = await db.select({ value: count() }).from(reports);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Administracao</h1>
        <p className="text-muted-foreground">Visao operacional do SaaS FitReport Pro.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat title="Personais" value={String(rows.length)} />
        <Stat title="Avaliacoes" value={String(assessmentCount?.value ?? 0)} />
        <Stat title="Relatorios" value={String(reportCount?.value ?? 0)} />
      </section>

      <Card className="rounded-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-blue-500" />
            Workspaces cadastrados
          </CardTitle>
          <CardDescription>Acesso liberado apenas para e-mails em `ADMIN_EMAILS`.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personal</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Alunos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.plan}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell className="text-right">{row.studentsCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card className="rounded-md">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}
