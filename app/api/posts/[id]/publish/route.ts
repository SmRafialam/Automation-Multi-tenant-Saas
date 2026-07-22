import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { publishToFacebook } from "@/lib/facebook";

/** Publish a scheduled post to Facebook immediately. */
export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/posts/[id]/publish">,
) {
  const { id } = await ctx.params;
  const { supabase, business } = await getBusiness();
  if (!business)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!post)
    return NextResponse.json({ error: "পোস্ট পাওয়া যায়নি" }, { status: 404 });

  const { data: conn } = await supabase
    .from("connections")
    .select("*")
    .eq("business_id", business.id)
    .eq("type", "facebook")
    .maybeSingle();

  if (!conn?.fb_page_id || !conn?.access_token) {
    await supabase
      .from("posts")
      .update({ status: "failed", error_message: "Facebook connection missing" })
      .eq("id", id);
    return NextResponse.json(
      { error: "Facebook Page যুক্ত নেই — Connections থেকে যুক্ত করুন" },
      { status: 400 },
    );
  }

  await supabase.from("posts").update({ status: "processing" }).eq("id", id);

  const result = await publishToFacebook({
    pageId: conn.fb_page_id,
    accessToken: conn.access_token,
    caption: post.caption || "",
    mediaUrl: post.media_url,
    mediaType: post.media_type,
  });

  if (result.ok) {
    await supabase
      .from("posts")
      .update({ status: "posted", fb_post_id: result.postId, error_message: null })
      .eq("id", id);
    return NextResponse.json({ ok: true, postId: result.postId });
  }

  await supabase
    .from("posts")
    .update({ status: "failed", error_message: result.error })
    .eq("id", id);
  return NextResponse.json({ error: result.error }, { status: 502 });
}
