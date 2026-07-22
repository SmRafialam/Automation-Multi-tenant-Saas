export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * True only when real Supabase credentials are present. Used to short-circuit
 * network calls (proxy/session) so the app still boots with placeholder envs
 * and can show a friendly "connect Supabase" setup screen instead of hanging.
 */
export const supabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("placeholder") &&
    SUPABASE_URL.startsWith("http"),
);
