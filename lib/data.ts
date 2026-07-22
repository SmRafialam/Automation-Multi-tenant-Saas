import { createClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types";

/** Returns the Supabase server client and current user (or null). */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Returns the business for the current user. A DB trigger creates one on
 * signup, but we self-heal here just in case it's missing.
 */
export async function getBusiness() {
  const { supabase, user } = await getSession();
  if (!user) return { supabase, user: null, business: null as Business | null };

  const { data: existing } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_user_id", user.id)
    .limit(1)
    .maybeSingle();

  let business = existing as Business | null;

  if (!business) {
    const { data } = await supabase
      .from("businesses")
      .insert({
        owner_user_id: user.id,
        name: (user.user_metadata?.business_name as string) || "My Business",
      })
      .select()
      .single();
    business = data as Business;
  }

  return { supabase, user, business };
}
