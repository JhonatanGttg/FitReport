import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "@/db/client";
import { trainers } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import type { SubscriptionPlan, SubscriptionStatus } from "@/lib/types";

export async function POST(request: Request) {
  const signature = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return Response.json({ error: "Webhook Stripe nao configurado." }, { status: 400 });

  const stripe = getStripe();
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Assinatura invalida." }, { status: 400 });
  }

  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const trainerId = session.metadata?.trainerId;
    const plan = session.metadata?.plan as SubscriptionPlan | undefined;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : "";
    if (trainerId && plan) {
      await db.update(trainers).set({
        plan,
        subscriptionStatus: "active",
        stripeSubscriptionId: subscriptionId,
      }).where(eq(trainers.id, trainerId));
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const trainerId = subscription.metadata?.trainerId;
    const plan = subscription.metadata?.plan as SubscriptionPlan | undefined;
    if (trainerId) {
      await db.update(trainers).set({
        plan: event.type === "customer.subscription.deleted" ? "free" : plan ?? "pro",
        subscriptionStatus: mapStripeStatus(subscription.status),
        stripeSubscriptionId: subscription.id,
      }).where(eq(trainers.id, trainerId));
    }
  }

  return Response.json({ received: true });
}

function mapStripeStatus(status: string): SubscriptionStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "past_due";
  if (status === "canceled") return "canceled";
  return "trial";
}
