import Link from "next/link";
import { getBusiness } from "@/lib/data";
import { getT } from "@/lib/lang";
import { num, money, dateFmt, translate } from "@/lib/i18n";
import { COURIER_NAME } from "@/lib/format";
import { Sparkline, AreaChart } from "@/components/charts";
import {
  IconTaka,
  IconBag,
  IconMegaphone,
  IconTrendUp,
  IconPlus,
  IconCheck,
} from "@/components/icons";
import type { Order, Post } from "@/lib/types";

const WEEKDAYS_BN = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default async function DashboardPage() {
  const { supabase, business } = await getBusiness();
  if (!business) return null;
  const { lang, t } = await getT();

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
  const weekdays = lang === "bn" ? WEEKDAYS_BN : WEEKDAYS_EN;
  const labels = days.map((d) => weekdays[d.getDay()]);

  const kpis = [
    {
      tint: "tint-teal",
      Icon: IconTaka,
      lbl: t("kpi.today_sales"),
      val: money(todaySales, lang),
      trend: t("kpi.trend_orders", { n: num(todaysOrders.length, lang) }),
      spark: salesSeries,
      color: "#2dd4bf",
    },
    {
      tint: "tint-blue",
      Icon: IconBag,
      lbl: t("kpi.today_orders"),
      val: num(todaysOrders.length, lang),
      trend: t("kpi.upto_today"),
      spark: orderSeries,
      color: "#60a5fa",
    },
    {
      tint: "tint-violet",
      Icon: IconMegaphone,
      lbl: t("kpi.pending_posts"),
      val: num(pendingPosts, lang),
      trend: t("kpi.in_schedule"),
      spark: orderSeries.map((v) => v + 1),
      color: "#a78bfa",
    },
    {
      tint: "tint-amber",
      Icon: IconBag,
      lbl: t("kpi.total_orders"),
      val: num(orderList.length, lang),
      trend: t("kpi.total"),
      spark: salesSeries.map((v) => v + 2),
      color: "#f59e0b",
    },
  ];

  const feed = orderList.slice(0, 5);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">{t("dash.welcome", { name: business.name })}</h1>
          <p className="bn">
            {t("dash.subtitle", {
              date: dateFmt(today, lang, {
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
            })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/posting" className="btn ghost bn">
            <IconMegaphone />
            {t("act.new_post")}
          </Link>
          <Link href="/orders" className="btn primary bn">
            <IconPlus />
            {t("act.new_order")}
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
              <h3 className="bn">{t("chart.title")}</h3>
              <div className="chart-legend" style={{ marginTop: 8 }}>
                <span className="l">
                  <i style={{ background: "#2dd4bf" }} /> {t("chart.sales")}
                </span>
                <span className="l">
                  <i style={{ background: "#3b82f6" }} /> {t("chart.orders")}
                </span>
              </div>
            </div>
          </div>
          <div className="chart-wrap">
            <AreaChart sales={salesSeries} orders={orderSeries} labels={labels} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="bn">{t("dash.activity")}</h3>
          </div>
          <div className="feed">
            {feed.length === 0 && (
              <div className="empty bn">{t("dash.no_activity")}</div>
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
                    <b>{o.customer_name}</b> — {money(Number(o.amount), lang)} (
                    {translate(lang, `status.${o.status}`)})
                  </div>
                  <div className="fd">
                    {dateFmt(o.created_at, lang, {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <h3 className="bn">{t("dash.recent_orders")}</h3>
          <Link href="/orders" className="link bn">
            {t("dash.all_orders")}
          </Link>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("th.customer")}</th>
                <th>{t("th.amount")}</th>
                <th>{t("th.courier")}</th>
                <th>{t("th.status")}</th>
              </tr>
            </thead>
            <tbody>
              {orderList.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="cell-main">{o.customer_name}</div>
                    <div className="cell-sub">{o.customer_phone}</div>
                  </td>
                  <td className="cell-main">{money(Number(o.amount), lang)}</td>
                  <td>{COURIER_NAME[o.courier]}</td>
                  <td>
                    <span className={`badge-s s-${o.status}`}>
                      {translate(lang, `status.${o.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
              {orderList.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty bn">
                    {t("dash.no_orders")} — <Link href="/orders">{t("dash.add")}</Link>
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
