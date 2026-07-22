import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { can } from "@/lib/roles";

/** Change a member's role (owner only, cannot target an owner). */
export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/team/[userId]">,
) {
  const { userId } = await ctx.params;
  const { supabase, business, role } = await getBusiness();
  if (!business) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(role, "manage_team"))
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const newRole = ["manager", "staff"].includes(body.role) ? body.role : null;
  if (!newRole) return NextResponse.json({ error: "invalid role" }, { status: 400 });

  const { error } = await supabase
    .from("business_members")
    .update({ role: newRole })
    .eq("business_id", business.id)
    .eq("user_id", userId)
    .neq("role", "owner");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Remove a member (owner only, cannot remove an owner). */
export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/team/[userId]">,
) {
  const { userId } = await ctx.params;
  const { supabase, business, role } = await getBusiness();
  if (!business) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(role, "manage_team"))
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const { error } = await supabase
    .from("business_members")
    .delete()
    .eq("business_id", business.id)
    .eq("user_id", userId)
    .neq("role", "owner");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
