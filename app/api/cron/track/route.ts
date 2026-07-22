import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSteadfastStatus } from "@/lib/steadfast";

export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Periodically refreshes delivery status for shipped Steadfast orders.
 */
export async function GET(req: Request) {
  if (!authorized(req))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: shipped } = await admin
    .from("orders")
    .select("*")
    .eq("status", "shipped")
    .eq("courier", "steadfast")
    .not("courier_tracking_id", "is", null)
    .limit(50);

  if (!shipped?.length) return NextResponse.json({ checked: 0 });

  let updated = 0;

  for (const order of shipped) {
    const { data: conn } = await admin
      .from("connections")
      .select("extra_json")
      .eq("business_id", order.business_id)
      .eq("type", "steadfast")
      .maybeSingle();

    const creds = conn?.extra_json as Record<string, string> | undefined;
    if (!creds?.api_key || !creds?.secret_key) continue;

    const res = await getSteadfastStatus(
      { apiKey: creds.api_key, secretKey: creds.secret_key },
      order.courier_tracking_id as string,
    );

    if (res.ok && res.status && res.status !== order.status) {
      await admin
        .from("orders")
        .update({ status: res.status, updated_at: new Date().toISOString() })
        .eq("id", order.id);
      updated++;
    }
  }

  return NextResponse.json({ checked: shipped.length, updated });
}
