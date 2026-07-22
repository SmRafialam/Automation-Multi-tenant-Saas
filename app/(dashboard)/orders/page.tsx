import { getBusiness } from "@/lib/data";
import { OrdersClient } from "@/components/orders-client";
import type { Order } from "@/lib/types";

export default async function OrdersPage() {
  const { supabase, business } = await getBusiness();
  if (!business) return null;

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return <OrdersClient orders={(data ?? []) as Order[]} />;
}
