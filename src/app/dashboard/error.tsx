"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-[70vh] place-items-center p-4">
      <Card className="w-full max-w-2xl rounded-md border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-orange-500" />
            Nao foi possivel carregar os dados
          </CardTitle>
          <CardDescription>
            Confira as variaveis de ambiente da Vercel e a conexao com o Supabase/Postgres.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-semibold">Diagnostico</p>
            <p className="mt-1 text-muted-foreground">{error.message || "Erro de renderizacao no servidor."}</p>
            {error.digest ? <p className="mt-2 font-mono text-xs text-muted-foreground">Digest: {error.digest}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <RefreshCw className="size-4" />
              Tentar novamente
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/health" target="_blank">Verificar /api/health</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
