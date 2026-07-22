import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";

export async function POST(req: Request) {
  const { supabase, business } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = String(body.customer_name || "").trim();
  const amount = Number(body.amount || 0);
  if (!name || !amount)
    return NextResponse.json(
      { error: "নাম ও এমাউন্ট দিন" },
      { status: 400 },
    );

  const { data, error } = await supabase
    .from("orders")
    .insert({
      business_id: business.id,
      customer_name: name,
      customer_phone: body.customer_phone || null,
      address: body.address || null,
      items: body.items || null,
      amount,
      courier: body.courier || "steadfast",
      status: "pending",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
