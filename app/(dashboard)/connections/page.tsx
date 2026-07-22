import { redirect } from "next/navigation";
import { getBusiness } from "@/lib/data";
import { can } from "@/lib/roles";
import { ConnectionsClient } from "@/components/connections-client";
import type { Connection } from "@/lib/types";

export default async function ConnectionsPage() {
  const { supabase, business, role } = await getBusiness();
  if (!business) return null;
  if (!can(role, "manage_connections")) redirect("/dashboard");

  const { data } = await supabase
    .from("connections")
    .select("*")
    .eq("business_id", business.id);

  return <ConnectionsClient connections={(data ?? []) as Connection[]} />;
}
