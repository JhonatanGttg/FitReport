"use client";

import { useSyncExternalStore } from "react";
import { demoData } from "@/lib/demo-data";
import type { Trainer } from "@/lib/types";

const key = "fitreport-pro:trainer-profile";
const eventName = "fitreport-pro:trainer-profile-updated";
let cachedRaw: string | null = null;
let cachedProfile: Trainer = demoData.trainer;

function readProfile(): Trainer {
  if (typeof window === "undefined") return demoData.trainer;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      cachedRaw = null;
      cachedProfile = demoData.trainer;
      return cachedProfile;
    }

    if (stored !== cachedRaw) {
      cachedRaw = stored;
      cachedProfile = { ...demoData.trainer, ...JSON.parse(stored) };
    }

    return cachedProfile;
  } catch {
    return demoData.trainer;
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
  const trainer = useSyncExternalStore(subscribe, readProfile, () => demoData.trainer);

  function saveTrainer(next: Trainer) {
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(eventName));
  }

  return { trainer, saveTrainer };
}
