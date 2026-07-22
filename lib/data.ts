import { createClient } from "@/lib/supabase/server";
import type { Business, Role } from "@/lib/types";

/** Returns the Supabase server client and current user (or null). */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/**
 * Resolves the current user's business AND their role in it (via
 * business_members). A DB trigger seeds this on signup; we self-heal here in
 * case it's missing.
 */
export async function getBusiness() {
  const { supabase, user } = await getSession();
  if (!user)
    return {
      supabase,
      user: null,
      business: null as Business | null,
      role: null as Role | null,
    };

  const { data: membership } = await supabase
    .from("business_members")
    .select("role, business:businesses(*)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership?.business) {
    return {
      supabase,
      user,
      business: membership.business as unknown as Business,
      role: membership.role as Role,
    };
  }

  // Self-heal: create a business + owner membership.
  const { data: business } = await supabase
    .from("businesses")
    .insert({
      owner_user_id: user.id,
      name:
        (user.user_metadata?.business_name as string) ||
        (user.user_metadata?.full_name as string) ||
        "My Business",
    })
    .select()
    .single();

  if (business) {
    await supabase.from("business_members").insert({
      business_id: business.id,
      user_id: user.id,
      email: user.email,
      role: "owner",
    });
    return { supabase, user, business: business as Business, role: "owner" as Role };
  }

  return { supabase, user, business: null, role: null };
}
