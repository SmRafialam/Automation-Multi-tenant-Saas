"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import type { Connection, ConnectionType } from "@/lib/types";
import {
  IconFacebook,
  IconTruck,
  IconSheet,
  IconWhatsapp,
  IconLink,
} from "@/components/icons";

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
}

interface Provider {
  type: ConnectionType;
  name: string;
  desc: string;
  tint: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  fields: FieldDef[];
  soon?: boolean;
}

const PROVIDERS: Provider[] = [
  {
    type: "facebook",
    name: "Facebook Page",
    desc: "পোস্ট অটো-পাবলিশ ও কমেন্ট",
    tint: "tint-blue",
    Icon: IconFacebook,
    fields: [
      { key: "fb_page_id", label: "Page ID", placeholder: "10482900..." },
      { key: "access_token", label: "Page Access Token", placeholder: "EAAG..." },
    ],
  },
  {
    type: "steadfast",
    name: "Steadfast Courier",
    desc: "অর্ডার পাঠানো ও ট্র্যাকিং",
    tint: "tint-teal",
    Icon: IconTruck,
    fields: [
      { key: "api_key", label: "API Key", placeholder: "merchant api key" },
      { key: "secret_key", label: "Secret Key", placeholder: "merchant secret" },
    ],
  },
  {
    type: "sheet",
    name: "Google Sheet",
    desc: "অর্ডার ও কাস্টমার সিংক",
    tint: "tint-green",
    Icon: IconSheet,
    fields: [{ key: "sheet_id", label: "Sheet ID", placeholder: "1aBcD..." }],
  },
  {
    type: "whatsapp",
    name: "WhatsApp Cloud",
    desc: "অর্ডার কনফার্মেশন মেসেজ (Phase 2)",
    tint: "tint-green",
    Icon: IconWhatsapp,
    fields: [],
    soon: true,
  },
];

export function ConnectionsClient({
  connections,
}: {
  connections: Connection[];
}) {
  const router = useRouter();
  const toast = useToast();
  const byType = new Map(connections.map((c) => [c.type, c]));
  const [drafts, setDrafts] = React.useState<
    Record<string, Record<string, string>>
  >({});
  const [busy, setBusy] = React.useState<string | null>(null);

  const setField = (type: string, key: string, val: string) =>
    setDrafts((d) => ({ ...d, [type]: { ...d[type], [key]: val } }));

  async function connect(p: Provider) {
    const values = drafts[p.type] || {};
    for (const f of p.fields) {
      if (!values[f.key]?.trim()) {
        toast("error", "তথ্য দিন", `${f.label} লাগবে`);
        return;
      }
    }
    setBusy(p.type);
    try {
      const payload: Record<string, unknown> = { type: p.type };
      if (p.type === "facebook") {
        payload.fb_page_id = values.fb_page_id;
        payload.access_token = values.access_token;
      } else {
        payload.extra_json = values;
      }
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast("success", p.name, "সফলভাবে সংযুক্ত হয়েছে");
        setDrafts((d) => ({ ...d, [p.type]: {} }));
        router.refresh();
      } else {
        toast("error", "সমস্যা", data.error || "সংযোগ হয়নি");
      }
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(type: ConnectionType, name: string) {
    setBusy(type);
    try {
      await fetch(`/api/connections/${type}`, { method: "DELETE" });
      toast("info", name, "সংযোগ বিচ্ছিন্ন হয়েছে");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">কানেকশন</h1>
          <p className="bn">
            আপনার অ্যাকাউন্টগুলো যুক্ত করুন — সব automation এখান থেকে চলবে
          </p>
        </div>
      </div>

      <div className="grid conn-grid">
        {PROVIDERS.map((p) => {
          const conn = byType.get(p.type);
          const on = Boolean(conn);
          return (
            <div className="card conn" key={p.type}>
              <div className="conn-top">
                <div className={`conn-ico ${p.tint}`}>
                  <p.Icon />
                </div>
                <div>
                  <h3>{p.name}</h3>
                  <div className="desc bn">{p.desc}</div>
                </div>
                <div className={`conn-status ${on ? "on" : "off"} bn`}>
                  {on ? "সংযুক্ত" : p.soon ? "শীঘ্রই" : "সংযুক্ত নয়"}
                </div>
              </div>

              {on ? (
                <>
                  <div className="conn-body">
                    {p.type === "facebook" ? (
                      <>
                        <div className="kv">
                          <span>Page ID</span>
                          <b>{conn!.fb_page_id}</b>
                        </div>
                        <div className="kv">
                          <span>Token</span>
                          <b>•••• সংরক্ষিত</b>
                        </div>
                      </>
                    ) : (
                      Object.entries(
                        (conn!.extra_json as Record<string, string>) || {},
                      ).map(([k, v]) => (
                        <div className="kv" key={k}>
                          <span>{k}</span>
                          <b>{v.length > 10 ? "•••• সংরক্ষিত" : v}</b>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="conn-actions">
                    <button
                      className="btn ghost sm bn"
                      onClick={() => disconnect(p.type, p.name)}
                      disabled={busy === p.type}
                    >
                      ডিসকানেক্ট
                    </button>
                  </div>
                </>
              ) : p.soon ? (
                <>
                  <div className="conn-body bn">
                    <div className="kv">
                      <span>স্ট্যাটাস</span>
                      <b>শীঘ্রই আসছে (Phase 2)</b>
                    </div>
                  </div>
                  <div className="conn-actions">
                    <button
                      className="btn ghost sm bn"
                      onClick={() =>
                        toast("info", p.name, "Phase 2-এ পাওয়া যাবে")
                      }
                    >
                      বিস্তারিত
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-grid" style={{ gap: 11 }}>
                    {p.fields.map((f) => (
                      <div key={f.key}>
                        <label className="bn">{f.label}</label>
                        <input
                          value={drafts[p.type]?.[f.key] || ""}
                          onChange={(e) =>
                            setField(p.type, f.key, e.target.value)
                          }
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="conn-actions">
                    <button
                      className="btn primary sm bn"
                      onClick={() => connect(p)}
                      disabled={busy === p.type}
                    >
                      <IconLink />
                      {busy === p.type ? "যুক্ত হচ্ছে..." : "যুক্ত করুন"}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
