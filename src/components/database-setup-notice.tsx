import Link from "next/link";
import { AlertTriangle, Database, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DatabaseSetupNotice({ detail }: { detail?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-2xl rounded-md border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5 text-orange-500" />
            Banco de dados nao conectado
          </CardTitle>
          <CardDescription>
            O FitReport Pro usa somente dados reais. Configure o Postgres/Supabase na Vercel para carregar dashboard, alunos, avaliacoes e relatorios.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {detail ? (
            <div className="flex gap-3 rounded-md border border-orange-500/20 bg-orange-500/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-500" />
              <span>{detail}</span>
            </div>
          ) : null}
          <div className="rounded-md border bg-muted/40 p-3">
            <p className="text-sm font-bold">Variaveis obrigatorias na Vercel</p>
            <pre className="mt-2 overflow-auto text-xs leading-6">
{`DATABASE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL`}
            </pre>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
              <Link href="/api/health" target="_blank">
                Verificar conexao
                <ExternalLink className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Voltar para login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
