import { redirect } from "next/navigation";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getBusiness } from "@/lib/data";
import { ToastProvider } from "@/components/toast";
import { Shell } from "@/components/shell";
import { SetupNotice } from "@/components/setup-notice";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigured) return <SetupNotice />;

  const { supabase, user, business } = await getBusiness();
  if (!user || !business) redirect("/login");

  const [{ count: pendingOrders }, { count: postUsage }] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "pending"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id),
  ]);

  return (
    <ToastProvider>
      <Shell
        business={business.name}
        plan={business.plan}
        email={user.email ?? ""}
        pendingOrders={pendingOrders ?? 0}
        postUsage={postUsage ?? 0}
      >
        {children}
      </Shell>
    </ToastProvider>
  );
}
