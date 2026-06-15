"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { trainers } from "@/db/schema";
import { getCurrentTrainer } from "@/lib/auth";
import { getStripe, stripePriceByPlan } from "@/lib/stripe";
import type { SubscriptionPlan } from "@/lib/types";

export async function createCheckoutSessionAction(plan: Exclude<SubscriptionPlan, "free">) {
  const trainer = await getCurrentTrainer();
  const price = stripePriceByPlan[plan];
  if (!price) throw new Error("Preco Stripe nao configurado para este plano.");

  const stripe = getStripe();
  const db = getDb();
  let customerId = trainer.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: trainer.name,
      metadata: { trainerId: trainer.id, userId: trainer.userId },
    });
    customerId = customer.id;
    await db.update(trainers).set({ stripeCustomerId: customerId }).where(eq(trainers.id, trainer.id));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/dashboard/assinatura?checkout=sucesso`,
    cancel_url: `${appUrl}/dashboard/assinatura?checkout=cancelado`,
    metadata: { trainerId: trainer.id, plan },
    subscription_data: {
      metadata: { trainerId: trainer.id, plan },
    },
  });

  if (!session.url) throw new Error("A Stripe nao retornou URL de checkout.");
  return session.url;
}

export async function createBillingPortalAction() {
  const trainer = await getCurrentTrainer();
  if (!trainer.stripeCustomerId) throw new Error("Este workspace ainda nao possui cliente Stripe.");

  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: trainer.stripeCustomerId,
    return_url: `${appUrl}/dashboard/assinatura`,
  });

  return session.url;
}
