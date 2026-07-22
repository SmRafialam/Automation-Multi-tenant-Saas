import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { can } from "@/lib/roles";

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/connections/[type]">,
) {
  const { type } = await ctx.params;
  const { supabase, business, role } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(role, "manage_connections"))
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("business_id", business.id)
    .eq("type", type);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
