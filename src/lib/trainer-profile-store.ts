"use client";

import { useSyncExternalStore } from "react";
import type { Trainer } from "@/lib/types";

const key = "fitreport-pro:trainer-profile";
const eventName = "fitreport-pro:trainer-profile-updated";
let cachedRaw: string | null = null;
const emptyTrainer: Trainer = {
  id: "",
  userId: "",
  name: "",
  logoUrl: "",
  photoUrl: "",
  instagram: "",
  whatsapp: "",
  brandPrimary: "#2563eb",
  brandSecondary: "#020617",
  motivationalPhrase: "",
  reportSignature: "",
  onboardingCompleted: false,
  plan: "free",
  subscriptionStatus: "trial",
  stripeCustomerId: "",
  stripeSubscriptionId: "",
};
let cachedProfile: Trainer = emptyTrainer;

function readProfile(): Trainer {
  if (typeof window === "undefined") return emptyTrainer;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      cachedRaw = null;
      cachedProfile = emptyTrainer;
      return cachedProfile;
    }

    if (stored !== cachedRaw) {
      cachedRaw = stored;
      cachedProfile = { ...emptyTrainer, ...JSON.parse(stored) };
    }

    return cachedProfile;
  } catch {
    return emptyTrainer;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useTrainerProfile() {
  const trainer = useSyncExternalStore(subscribe, readProfile, () => emptyTrainer);

  function saveTrainer(next: Trainer) {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(eventName));
  }

  return { trainer, saveTrainer };
}
