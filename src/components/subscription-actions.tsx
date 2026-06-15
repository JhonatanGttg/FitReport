"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBillingPortalAction, createCheckoutSessionAction } from "@/app/dashboard/assinatura/actions";
import type { SubscriptionPlan } from "@/lib/types";

export function SubscribeButton({
  plan,
  current,
  stripeReady,
}: {
  plan: Exclude<SubscriptionPlan, "free">;
  current: boolean;
  stripeReady: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function subscribe() {
    startTransition(async () => {
      try {
        const url = current ? await createBillingPortalAction() : await createCheckoutSessionAction(plan);
        window.location.href = url;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Nao foi possivel iniciar a assinatura.");
      }
    });
  }

  return (
    <Button className={current ? "w-full" : "w-full bg-blue-600 text-white hover:bg-blue-700"} variant={current ? "outline" : "default"} disabled={!stripeReady || isPending} onClick={subscribe}>
      {!stripeReady ? (
        <span className="inline-flex items-center gap-2"><LockKeyhole className="size-4" /> Configurar Stripe</span>
      ) : current ? isPending ? "Abrindo..." : "Gerenciar assinatura" : isPending ? "Abrindo checkout..." : "Assinar com Stripe"}
    </Button>
  );
}
