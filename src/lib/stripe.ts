import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY nao configurada.");

  stripeClient ??= new Stripe(secretKey, {
    apiVersion: "2026-05-27.dahlia",
  });

  return stripeClient;
}

export const stripePriceByPlan = {
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "",
  studio: process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID ?? "",
};
