import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishToFacebook } from "@/lib/facebook";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // must configure a secret to run
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Runs every minute (Vercel Cron). Finds due pending posts and publishes them
 * to Facebook, then records the result. Uses the service-role client so it can
 * work across every tenant without a user session.
 */
export async function GET(req: Request) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: due } = await admin
    .from("posts")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_time", now)
    .limit(25);

  if (!due?.length) return NextResponse.json({ processed: 0 });

  let posted = 0;
  let failed = 0;

  for (const post of due) {
    const { data: conn } = await admin
      .from("connections")
      .select("*")
      .eq("business_id", post.business_id)
      .eq("type", "facebook")
      .maybeSingle();

    if (!conn?.fb_page_id || !conn?.access_token) {
      await admin
        .from("posts")
        .update({ status: "failed", error_message: "Facebook not connected" })
        .eq("id", post.id);
      failed++;
      continue;
    }

    await admin.from("posts").update({ status: "processing" }).eq("id", post.id);

    const result = await publishToFacebook({
      pageId: conn.fb_page_id,
      accessToken: conn.access_token,
      caption: post.caption || "",
      mediaUrl: post.media_url,
      mediaType: post.media_type,
    });

    if (result.ok) {
      await admin
        .from("posts")
        .update({
          status: "posted",
          fb_post_id: result.postId,
          error_message: null,
        })
        .eq("id", post.id);
      posted++;
    } else {
      await admin
        .from("posts")
        .update({ status: "failed", error_message: result.error })
        .eq("id", post.id);
      failed++;
    }
  }

  return NextResponse.json({ processed: due.length, posted, failed });
}
