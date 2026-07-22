"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { bn, money, STATUS_BN, COURIER_NAME } from "@/lib/format";
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
      toast("error", "তথ্য অসম্পূর্ণ", "নাম আর এমাউন্ট দিন");
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
        toast("success", "অর্ডার যুক্ত হয়েছে", "এখন কুরিয়ারে পাঠাতে পারেন");
        router.refresh();
      } else {
        toast("error", "সমস্যা", data.error || "সেভ হয়নি");
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendCourier(id: string) {
    setRowBusy(id);
    toast("info", "Steadfast-এ পাঠানো হচ্ছে...", "অর্ডার তথ্য সাবমিট হচ্ছে");
    try {
      const res = await fetch(`/api/orders/${id}/courier`, { method: "POST" });
      const data = await res.json();
      if (res.ok)
        toast(
          "success",
          "কুরিয়ারে পাঠানো হয়েছে",
          `ট্র্যাকিং: ${data.order?.courier_tracking_id ?? "OK"}`,
        );
      else toast("error", "পাঠানো যায়নি", data.error || "Steadfast error");
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  const stats = [
    { tint: "tint-amber", Icon: IconClock, lbl: "পেন্ডিং", val: bn(stat("pending")) },
    { tint: "tint-violet", Icon: IconTruck, lbl: "শিপড", val: bn(stat("shipped")) },
    { tint: "tint-green", Icon: IconCheck, lbl: "ডেলিভার্ড", val: bn(stat("delivered")) },
    { tint: "tint-teal", Icon: IconTaka, lbl: "মোট এমাউন্ট", val: money(totalAmount) },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">অর্ডার ও কুরিয়ার</h1>
          <p className="bn">
            অর্ডার ম্যানেজ করুন আর এক ক্লিকে Steadfast-এ পাঠান
          </p>
        </div>
        <button className="btn primary bn" onClick={() => setOpen(true)}>
          <IconPlus />
          নতুন অর্ডার
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
            সব অর্ডার <span className="pill-count">{bn(orders.length)} টি</span>
          </h3>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>কাস্টমার / আইটেম</th>
                <th>ফোন</th>
                <th>এমাউন্ট</th>
                <th>ট্র্যাকিং</th>
                <th>স্ট্যাটাস</th>
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
                        <span className="cell-sub">
                          {COURIER_NAME[o.courier]}
                        </span>
                        <br />
                        {o.courier_tracking_id}
                      </>
                    ) : (
                      <span className="cell-sub">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge-s s-${o.status}`}>
                      {STATUS_BN[o.status]}
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
                        title="ট্র্যাক"
                        onClick={() =>
                          toast(
                            "info",
                            "ট্র্যাকিং",
                            `${o.courier_tracking_id || "—"} — ${STATUS_BN[o.status]}`,
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
                    এখনো কোনো অর্ডার নেই — উপরে ডান দিক থেকে যোগ করুন
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
              <h3 className="bn">নতুন অর্ডার</h3>
              <button onClick={() => setOpen(false)}>
                <IconClose />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="row2">
                  <div>
                    <label className="bn">কাস্টমারের নাম</label>
                    <input
                      value={form.customer_name}
                      onChange={(e) => set("customer_name", e.target.value)}
                      placeholder="যেমন: তানিয়া আক্তার"
                    />
                  </div>
                  <div>
                    <label className="bn">ফোন</label>
                    <input
                      value={form.customer_phone}
                      onChange={(e) => set("customer_phone", e.target.value)}
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="bn">ঠিকানা</label>
                  <input
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="বাসা, রোড, এলাকা, জেলা"
                  />
                </div>
                <div className="row2">
                  <div>
                    <label className="bn">আইটেম</label>
                    <input
                      value={form.items}
                      onChange={(e) => set("items", e.target.value)}
                      placeholder="থ্রি-পিস (M) x1"
                    />
                  </div>
                  <div>
                    <label className="bn">এমাউন্ট (৳)</label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                      placeholder="1250"
                    />
                  </div>
                </div>
                <div>
                  <label className="bn">কুরিয়ার</label>
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
                বাতিল
              </button>
              <button
                className="btn primary bn"
                onClick={addOrder}
                disabled={busy}
              >
                {busy ? "সেভ হচ্ছে..." : "অর্ডার সেভ করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
