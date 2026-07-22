import Link from "next/link";
import { getBusiness } from "@/lib/data";
import { Sparkline, AreaChart } from "@/components/charts";
import {
  IconTaka,
  IconBag,
  IconMegaphone,
  IconUser,
  IconTrendUp,
  IconPlus,
  IconCheck,
  IconSparkle,
} from "@/components/icons";
import { bn, money, bnDateTime, STATUS_BN, COURIER_NAME } from "@/lib/format";
import type { Order, Post } from "@/lib/types";

const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default async function DashboardPage() {
  const { supabase, business } = await getBusiness();
  if (!business) return null;

  const [{ data: orders }, { data: posts }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("posts")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const orderList = (orders ?? []) as Order[];
  const postList = (posts ?? []) as Post[];
  const today = new Date();

  const todaysOrders = orderList.filter((o) =>
    sameDay(new Date(o.created_at), today),
  );
  const todaySales = todaysOrders.reduce((s, o) => s + Number(o.amount), 0);
  const pendingPosts = postList.filter((p) => p.status === "pending").length;

  // last 7 day series
  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const salesSeries = days.map((d) =>
    Math.round(
      orderList
        .filter((o) => sameDay(new Date(o.created_at), d))
        .reduce((s, o) => s + Number(o.amount), 0) / 1000,
    ),
  );
  const orderSeries = days.map(
    (d) => orderList.filter((o) => sameDay(new Date(o.created_at), d)).length,
  );
  const labels = days.map((d) => WEEKDAYS_BN[d.getDay()]);

  const kpis = [
    {
      tint: "tint-teal",
      Icon: IconTaka,
      lbl: "আজকের বিক্রি",
      val: money(todaySales),
      trend: `+${bn(todaysOrders.length)} অর্ডার`,
      spark: salesSeries,
      color: "#2dd4bf",
    },
    {
      tint: "tint-blue",
      Icon: IconBag,
      lbl: "আজকের অর্ডার",
      val: bn(todaysOrders.length),
      trend: "আজ পর্যন্ত",
      spark: orderSeries,
      color: "#60a5fa",
    },
    {
      tint: "tint-violet",
      Icon: IconMegaphone,
      lbl: "পেন্ডিং পোস্ট",
      val: bn(pendingPosts),
      trend: "শিডিউলে আছে",
      spark: orderSeries.map((v) => v + 1),
      color: "#a78bfa",
    },
    {
      tint: "tint-amber",
      Icon: IconBag,
      lbl: "মোট অর্ডার",
      val: bn(orderList.length),
      trend: "সর্বমোট",
      spark: salesSeries.map((v) => v + 2),
      color: "#f59e0b",
    },
  ];

  const feed = orderList.slice(0, 5);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">স্বাগতম, {business.name} 👋</h1>
          <p className="bn">
            আজ আপনার ব্যবসার এক নজরে অবস্থা —{" "}
            {today.toLocaleDateString("bn-BD", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/posting" className="btn ghost bn">
            <IconMegaphone />
            নতুন পোস্ট
          </Link>
          <Link href="/orders" className="btn primary bn">
            <IconPlus />
            নতুন অর্ডার
          </Link>
        </div>
      </div>

      <div className="grid kpis">
        {kpis.map((k) => (
          <div className="card kpi" key={k.lbl}>
            <div className={`ico ${k.tint}`}>
              <k.Icon />
            </div>
            <div className="lbl bn">{k.lbl}</div>
            <div className="val">{k.val}</div>
            <span className="trend up bn">
              <IconTrendUp width={13} />
              {k.trend}
            </span>
            <span className="spark">
              <Sparkline data={k.spark} color={k.color} />
            </span>
          </div>
        ))}
      </div>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="bn">বিক্রি ও অর্ডার</h3>
              <div className="chart-legend" style={{ marginTop: 8 }}>
                <span className="l">
                  <i style={{ background: "#2dd4bf" }} /> বিক্রি (হাজার ৳)
                </span>
                <span className="l">
                  <i style={{ background: "#3b82f6" }} /> অর্ডার
                </span>
              </div>
            </div>
          </div>
          <div className="chart-wrap">
            <AreaChart
              sales={salesSeries}
              orders={orderSeries}
              labels={labels}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="bn">সাম্প্রতিক কার্যকলাপ</h3>
          </div>
          <div className="feed">
            {feed.length === 0 && (
              <div className="empty bn">এখনো কোনো কার্যকলাপ নেই</div>
            )}
            {feed.map((o) => (
              <div className="feed-item" key={o.id}>
                <div
                  className={`fi ${
                    o.status === "delivered"
                      ? "tint-green"
                      : o.status === "shipped"
                        ? "tint-violet"
                        : "tint-blue"
                  }`}
                >
                  {o.status === "delivered" ? <IconCheck /> : <IconBag />}
                </div>
                <div>
                  <div className="ft bn">
                    <b>{o.customer_name}</b> — {money(Number(o.amount))} (
                    {STATUS_BN[o.status]})
                  </div>
                  <div className="fd">{bnDateTime(o.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <h3 className="bn">সাম্প্রতিক অর্ডার</h3>
          <Link href="/orders" className="link bn">
            সব অর্ডার →
          </Link>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>কাস্টমার</th>
                <th>এমাউন্ট</th>
                <th>কুরিয়ার</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {orderList.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="cell-main">{o.customer_name}</div>
                    <div className="cell-sub">{o.customer_phone}</div>
                  </td>
                  <td className="cell-main">{money(Number(o.amount))}</td>
                  <td>{COURIER_NAME[o.courier]}</td>
                  <td>
                    <span className={`badge-s s-${o.status}`}>
                      {STATUS_BN[o.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {orderList.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty bn">
                    এখনো কোনো অর্ডার নেই — <Link href="/orders">যোগ করুন</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
