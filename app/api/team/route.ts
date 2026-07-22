import { NextResponse } from "next/server";
import { getBusiness } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { can } from "@/lib/roles";

/** Add a member to the business by email (owner only). */
export async function POST(req: Request) {
  const { business, role } = await getBusiness();
  if (!business) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!can(role, "manage_team"))
    return NextResponse.json({ error: "শুধু মালিক টিম ম্যানেজ করতে পারেন" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const newRole = ["manager", "staff"].includes(body.role) ? body.role : "staff";
  if (!email) return NextResponse.json({ error: "ইমেইল দিন" }, { status: 400 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json(
      { error: "টিম যোগ করতে SUPABASE_SERVICE_ROLE_KEY দরকার" },
      { status: 400 },
    );

  const admin = createAdminClient();

  // Find the user by email (they must have signed up first).
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr)
    return NextResponse.json({ error: listErr.message }, { status: 500 });

  const target = list.users.find((u) => u.email?.toLowerCase() === email);
  if (!target)
    return NextResponse.json(
      { error: "এই ইমেইলে কোনো ইউজার নেই — আগে তাকে সাইন আপ করতে বলুন" },
      { status: 404 },
    );

  const { error } = await admin.from("business_members").upsert(
    {
      business_id: business.id,
      user_id: target.id,
      email,
      role: newRole,
    },
    { onConflict: "business_id,user_id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
