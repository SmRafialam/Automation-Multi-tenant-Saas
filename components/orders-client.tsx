"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/lang-provider";
import { translate } from "@/lib/i18n";
import { COURIER_NAME } from "@/lib/format";
import type { Courier, Order } from "@/lib/types";
import {
  IconPlus,
  IconClose,
  IconSend,
  IconPin,
  IconClock,
  IconTruck,
  IconCheck,
  IconTaka,
} from "@/components/icons";

const empty = {
  customer_name: "",
  customer_phone: "",
  address: "",
  items: "",
  amount: "",
  courier: "steadfast" as Courier,
};

export function OrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const toast = useToast();
  const { t, num, money, lang } = useLang();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ ...empty });
  const [busy, setBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);

  const stat = (s: string) => orders.filter((o) => o.status === s).length;
  const totalAmount = orders.reduce((a, o) => a + Number(o.amount), 0);
  const set = (k: keyof typeof empty, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function addOrder() {
    if (!form.customer_name.trim() || !Number(form.amount)) {
      toast("error", t("t.o_incomplete.t"), t("t.o_incomplete.m"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ ...empty });
        setOpen(false);
        toast("success", t("t.o_added.t"), t("t.o_added.m"));
        router.refresh();
      } else {
        toast("error", t("err.title"), data.error || t("err.not_saved"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendCourier(id: string) {
    setRowBusy(id);
    toast("info", t("t.o_sending.t"), t("t.o_sending.m"));
    try {
      const res = await fetch(`/api/orders/${id}/courier`, { method: "POST" });
      const data = await res.json();
      if (res.ok)
        toast(
          "success",
          t("t.o_shipped.t"),
          `${t("th.tracking")}: ${data.order?.courier_tracking_id ?? "OK"}`,
        );
      else toast("error", t("t.o_ship_fail.t"), data.error || t("err.title"));
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  const stats = [
    { tint: "tint-amber", Icon: IconClock, lbl: t("stat.pending"), val: num(stat("pending")) },
    { tint: "tint-violet", Icon: IconTruck, lbl: t("stat.shipped"), val: num(stat("shipped")) },
    { tint: "tint-green", Icon: IconCheck, lbl: t("stat.delivered"), val: num(stat("delivered")) },
    { tint: "tint-teal", Icon: IconTaka, lbl: t("stat.total_amount"), val: money(totalAmount) },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">{t("orders.title")}</h1>
          <p className="bn">{t("orders.subtitle")}</p>
        </div>
        <button className="btn primary bn" onClick={() => setOpen(true)}>
          <IconPlus />
          {t("act.new_order")}
        </button>
      </div>

      <div className="grid kpis" style={{ marginBottom: 18 }}>
        {stats.map((s) => (
          <div className="card kpi" key={s.lbl}>
            <div className={`ico ${s.tint}`}>
              <s.Icon />
            </div>
            <div className="lbl bn">{s.lbl}</div>
            <div className="val">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3 className="bn">
            {t("orders.all")}{" "}
            <span className="pill-count">
              {t("count.items", { n: num(orders.length) })}
            </span>
          </h3>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("th.customer_item")}</th>
                <th>{t("th.phone")}</th>
                <th>{t("th.amount")}</th>
                <th>{t("th.tracking")}</th>
                <th>{t("th.status")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="cell-main">{o.customer_name}</div>
                    <div className="cell-sub">{o.items || "—"}</div>
                  </td>
                  <td className="cell-sub">{o.customer_phone || "—"}</td>
                  <td className="cell-main">{money(Number(o.amount))}</td>
                  <td>
                    {o.courier_tracking_id ? (
                      <>
                        <span className="cell-sub">{COURIER_NAME[o.courier]}</span>
                        <br />
                        {o.courier_tracking_id}
                      </>
                    ) : (
                      <span className="cell-sub">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-s s-${o.status}`}>
                      {translate(lang, `status.${o.status}`)}
                    </span>
                  </td>
                  <td className="row-act">
                    {o.status === "pending" ? (
                      <button
                        className="btn primary sm bn"
                        onClick={() => sendCourier(o.id)}
                        disabled={rowBusy === o.id}
                      >
                        <IconSend />
                        Steadfast
                      </button>
                    ) : (
                      <button
                        className="mini"
                        title={t("t.track.t")}
                        onClick={() =>
                          toast(
                            "info",
                            t("t.track.t"),
                            `${o.courier_tracking_id || "—"} — ${translate(lang, `status.${o.status}`)}`,
                          )
                        }
                      >
                        <IconPin />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty bn">
                    {t("orders.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="modal-bg" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 className="bn">{t("act.new_order")}</h3>
              <button onClick={() => setOpen(false)}>
                <IconClose />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="row2">
                  <div>
                    <label className="bn">{t("orders.m.name")}</label>
                    <input
                      value={form.customer_name}
                      onChange={(e) => set("customer_name", e.target.value)}
                      placeholder={t("orders.m.name_ph")}
                    />
                  </div>
                  <div>
                    <label className="bn">{t("th.phone")}</label>
                    <input
                      value={form.customer_phone}
                      onChange={(e) => set("customer_phone", e.target.value)}
                      placeholder={t("orders.m.phone_ph")}
                    />
                  </div>
                </div>
                <div>
                  <label className="bn">{t("orders.m.address")}</label>
                  <input
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder={t("orders.m.address_ph")}
                  />
                </div>
                <div className="row2">
                  <div>
                    <label className="bn">{t("orders.m.items")}</label>
                    <input
                      value={form.items}
                      onChange={(e) => set("items", e.target.value)}
                      placeholder={t("orders.m.items_ph")}
                    />
                  </div>
                  <div>
                    <label className="bn">{t("orders.m.amount")}</label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                      placeholder="1250"
                    />
                  </div>
                </div>
                <div>
                  <label className="bn">{t("orders.m.courier")}</label>
                  <select
                    value={form.courier}
                    onChange={(e) => set("courier", e.target.value)}
                  >
                    <option value="steadfast">Steadfast</option>
                    <option value="pathao">Pathao</option>
                    <option value="redx">RedX</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn ghost bn" onClick={() => setOpen(false)}>
                {t("act.cancel")}
              </button>
              <button className="btn primary bn" onClick={addOrder} disabled={busy}>
                {busy ? t("posting.saving") : t("orders.m.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
