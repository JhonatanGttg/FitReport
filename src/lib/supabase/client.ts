import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function hasSupabaseEnv() {
  return Boolean(url && publishableKey);
}

export const supabase = url && publishableKey
  ? createSupabaseClient(url, publishableKey)
  : null;
