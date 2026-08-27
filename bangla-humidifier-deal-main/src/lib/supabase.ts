import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | undefined;
let anonClient: SupabaseClient | undefined;

/**
 * Returns the browser client used for Supabase Auth (admin dashboard).
 * VITE_ variables are intentionally public build-time variables, so this must
 * only ever receive the Supabase publishable key.
 */
export function getSupabaseClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"];
  const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return supabaseClient;
}

/**
 * Returns a dedicated anonymous client for the public customer order form.
 * persistSession is disabled so it never picks up an admin session from
 * localStorage, ensuring the INSERT always goes through as the anon role.
 */
export function getAnonymousSupabaseClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"];
  const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

  if (!url || !publishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  if (!anonClient) {
    anonClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  return anonClient;
}
