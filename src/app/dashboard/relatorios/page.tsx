import Link from "next/link";
import { FileText, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

export default async function ReportsPage() {
  const data = await getAppData();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Relatorios</h1>
        <p className="text-muted-foreground">Selecione um comparativo pronto ou gere novos relatorios a partir das avaliacoes.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {data.students.map((student) => {
          const assessments = data.assessments
            .filter((item) => item.studentId === student.id)
            .sort((a, b) => a.date.localeCompare(b.date));
          const first = assessments.at(-2);
          const second = assessments.at(-1);
          const latestDate = second ? new Date(`${second.date}T00:00:00`).toLocaleDateString("pt-BR") : null;
          return (
            <Card key={student.id} className="rounded-md border-blue-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-5 text-blue-500" />
                  {student.name}
                </CardTitle>
                <CardDescription>
                  {assessments.length} acompanhamentos registrados{latestDate ? ` | ultimo em ${latestDate}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">Acesse o historico completo ou gere um comparativo entre duas avaliacoes.</p>
                <div className="grid gap-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/alunos/${student.id}`}>Ver historico</Link>
                  </Button>
                  {first && second ? (
                    <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
                      <Link href={`/dashboard/relatorios/comparativo?student=${student.id}&first=${first.id}&second=${second.id}`}>Comparar ultimos</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {data.reports.map((report) => {
          const student = data.students.find((item) => item.id === report.studentId)!;
          return (
            <Card key={report.id} className="rounded-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-blue-500" />
                  {student.name}
                </CardTitle>
                <CardDescription>Criado em {new Date(`${report.createdAt}T00:00:00`).toLocaleDateString("pt-BR")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{report.professionalAnalysis}</p>
                <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  <Link href={`/dashboard/relatorios/${report.id}`}>Abrir relatorio</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
