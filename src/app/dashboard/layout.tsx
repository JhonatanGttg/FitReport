import { AppShell } from "@/components/app-shell";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { getCurrentTrainer, requireAuthenticatedUser } from "@/lib/auth";
import type { Trainer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticatedUser();
  let trainer;
  try {
    trainer = await getCurrentTrainer();
  } catch (error) {
    console.error("Falha ao preparar workspace do personal.", error);
    return <DatabaseSetupNotice detail={error instanceof Error ? error.message : "Nao foi possivel conectar ao banco."} />;
  }

  const shellTrainer: Trainer = {
    id: trainer.id,
    userId: trainer.userId,
    name: trainer.name,
    logoUrl: trainer.logoUrl,
    photoUrl: trainer.photoUrl,
    instagram: trainer.instagram,
    whatsapp: trainer.whatsapp,
    brandPrimary: trainer.brandPrimary,
    brandSecondary: trainer.brandSecondary,
    motivationalPhrase: trainer.motivationalPhrase,
    reportSignature: trainer.reportSignature,
    onboardingCompleted: trainer.onboardingCompleted,
    plan: trainer.plan as Trainer["plan"],
    subscriptionStatus: trainer.subscriptionStatus as Trainer["subscriptionStatus"],
    stripeCustomerId: trainer.stripeCustomerId,
    stripeSubscriptionId: trainer.stripeSubscriptionId,
  };

  return <AppShell trainer={shellTrainer}>{children}</AppShell>;
}
