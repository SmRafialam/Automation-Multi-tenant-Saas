import { redirect } from "next/navigation";
import { getBusiness } from "@/lib/data";
import { can } from "@/lib/roles";
import { TeamClient } from "@/components/team-client";
import type { Member } from "@/lib/types";

export default async function TeamPage() {
  const { supabase, user, business, role } = await getBusiness();
  if (!business || !user) redirect("/login");
  if (!can(role, "manage_team")) redirect("/dashboard");

  const { data } = await supabase
    .from("business_members")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: true });

  return (
    <TeamClient
      members={(data ?? []) as Member[]}
      currentUserId={user.id}
    />
  );
}
