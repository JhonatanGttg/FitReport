import { CheckCircle2, CreditCard, Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscribeButton } from "@/components/subscription-actions";
import { getAppData } from "@/lib/data";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    description: "Para testar a metodologia com poucos alunos.",
    limit: "5 alunos / 5 relatórios mensais",
    features: ["Cadastro de alunos", "Avaliações físicas", "Relatório comparativo básico"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49/mês",
    description: "Para personal que entrega relatórios premium com frequência.",
    limit: "50 alunos / relatórios ilimitados",
    features: ["Relatórios salvos", "PDF premium", "Links compartilháveis", "Análise editável"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "R$ 149/mês",
    description: "Para equipes, studios e operação com alto volume.",
    limit: "Alunos ilimitados / gestão avançada",
    features: ["Tudo do Pro", "Modelos por objetivo", "Prioridade em melhorias", "Área administrativa"],
  },
];

export default async function SubscriptionPage() {
  const data = await getAppData();
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Assinatura</h1>
        <p className="text-muted-foreground">Planos SaaS preparados para Stripe Billing e Checkout Sessions.</p>
      </div>

      <Card className="rounded-md border-blue-500/20">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-blue-500" />
              Plano atual
            </CardTitle>
            <CardDescription>Controle de acesso e limites do workspace.</CardDescription>
          </div>
          <Badge className="w-fit bg-blue-600 text-white">{data.trainer.plan.toUpperCase()} | {data.trainer.subscriptionStatus}</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <Info label="Alunos cadastrados" value={String(data.students.length)} />
          <Info label="Relatorios salvos" value={String(data.reports.length)} />
          <Info label="Stripe" value={stripeReady ? "Configurado" : "Aguardando chaves"} />
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {plans.map((plan) => {
          const current = data.trainer.plan === plan.id;
          return (
            <Card key={plan.id} className={`rounded-md ${current ? "border-blue-500 shadow-lg shadow-blue-600/10" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2">
                    {plan.id === "studio" ? <Crown className="size-5 text-blue-500" /> : <Sparkles className="size-5 text-blue-500" />}
                    {plan.name}
                  </CardTitle>
                  {current ? <Badge className="bg-emerald-600 text-white">Atual</Badge> : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div>
                  <p className="text-3xl font-black">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">{plan.limit}</p>
                </div>
                <ul className="grid gap-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id === "free" ? (
                  <div className="rounded-md border px-3 py-2 text-center text-sm font-semibold text-muted-foreground">
                    Plano gratuito
                  </div>
                ) : (
                  <SubscribeButton plan={plan.id as "pro" | "studio"} current={current} stripeReady={stripeReady} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
}
