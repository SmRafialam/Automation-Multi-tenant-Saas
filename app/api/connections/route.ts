import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { can } from "@/lib/roles";

/** Create or update a connection (upsert on business + type). */
export async function POST(req: Request) {
  const { supabase, business, role } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(role, "manage_connections"))
    return NextResponse.json({ error: "অনুমতি নেই" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const type = String(body.type || "");
  if (!["facebook", "sheet", "steadfast", "whatsapp"].includes(type))
    return NextResponse.json({ error: "invalid type" }, { status: 400 });

  const { data, error } = await supabase
    .from("connections")
    .upsert(
      {
        business_id: business.id,
        type,
        fb_page_id: body.fb_page_id || null,
        access_token: body.access_token || null,
        extra_json: body.extra_json || {},
        status: "connected",
      },
      { onConflict: "business_id,type" },
    )
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connection: data });
}
