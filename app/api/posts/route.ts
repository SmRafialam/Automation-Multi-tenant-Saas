import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";

export async function POST(req: Request) {
  const { supabase, business } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caption = String(body.caption || "").trim();
  if (!caption)
    return NextResponse.json({ error: "ক্যাপশন দিন" }, { status: 400 });

  const { data, error } = await supabase
    .from("posts")
    .insert({
      business_id: business.id,
      caption,
      media_url: body.media_url || null,
      media_type: body.media_type || "image",
      scheduled_time: body.scheduled_time || null,
      status: "pending",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}
