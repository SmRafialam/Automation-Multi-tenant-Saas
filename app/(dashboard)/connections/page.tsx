import { getBusiness } from "@/lib/data";
import { ConnectionsClient } from "@/components/connections-client";
import type { Connection } from "@/lib/types";

export default async function ConnectionsPage() {
  const { supabase, business } = await getBusiness();
  if (!business) return null;

  const { data } = await supabase
    .from("connections")
    .select("*")
    .eq("business_id", business.id);

  return <ConnectionsClient connections={(data ?? []) as Connection[]} />;
}
