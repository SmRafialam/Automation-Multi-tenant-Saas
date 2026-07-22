import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { createSteadfastOrder } from "@/lib/steadfast";

/** Send an order to Steadfast and store the returned tracking code. */
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/orders/[id]/courier">,
) {
  const { id } = await ctx.params;
  const { supabase, business } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!order)
    return NextResponse.json({ error: "অর্ডার পাওয়া যায়নি" }, { status: 404 });

  const { data: conn } = await supabase
    .from("connections")
    .select("*")
    .eq("business_id", business.id)
    .eq("type", "steadfast")
    .maybeSingle();

  const apiKey = (conn?.extra_json as Record<string, string>)?.api_key;
  const secretKey = (conn?.extra_json as Record<string, string>)?.secret_key;
  if (!conn || !apiKey || !secretKey) {
    return NextResponse.json(
      { error: "Steadfast যুক্ত নেই — Connections থেকে API key দিন" },
      { status: 400 },
    );
  }

  const result = await createSteadfastOrder(
    { apiKey, secretKey },
    {
      invoice: `AF-${order.id.slice(0, 8)}`,
      recipientName: order.customer_name || "Customer",
      recipientPhone: order.customer_phone || "",
      recipientAddress: order.address || "",
      amount: Number(order.amount),
      note: order.items || "",
    },
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const { data: updated } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      courier_tracking_id: result.trackingCode,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return NextResponse.json({ ok: true, order: updated });
}
