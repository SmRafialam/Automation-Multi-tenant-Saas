import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/connections/[type]">,
) {
  const { type } = await ctx.params;
  const { supabase, business } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("business_id", business.id)
    .eq("type", type);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
