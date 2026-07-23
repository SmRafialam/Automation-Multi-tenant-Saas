"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/lang-provider";
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
  nameKey: string;
  descKey: string;
  tint: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  fields: FieldDef[];
  soon?: boolean;
}

const PROVIDERS: Provider[] = [
  {
    type: "facebook",
    nameKey: "conn.fb.name",
    descKey: "conn.fb.desc",
    tint: "tint-blue",
    Icon: IconFacebook,
    fields: [
      { key: "fb_page_id", label: "Page ID", placeholder: "10482900..." },
      { key: "access_token", label: "Page Access Token", placeholder: "EAAG..." },
    ],
  },
  {
    type: "steadfast",
    nameKey: "conn.sf.name",
    descKey: "conn.sf.desc",
    tint: "tint-teal",
    Icon: IconTruck,
    fields: [
      { key: "api_key", label: "API Key", placeholder: "merchant api key" },
      { key: "secret_key", label: "Secret Key", placeholder: "merchant secret" },
    ],
  },
  {
    type: "sheet",
    nameKey: "conn.sheet.name",
    descKey: "conn.sheet.desc",
    tint: "tint-green",
    Icon: IconSheet,
    fields: [{ key: "sheet_id", label: "Sheet ID", placeholder: "1aBcD..." }],
  },
  {
    type: "whatsapp",
    nameKey: "conn.wa.name",
    descKey: "conn.wa.desc",
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
  const { t } = useLang();
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
        toast("error", t("t.c_fill.t"), f.label);
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
        toast("success", t(p.nameKey), t("t.c_ok.m"));
        setDrafts((d) => ({ ...d, [p.type]: {} }));
        router.refresh();
      } else {
        toast("error", t("err.title"), data.error || t("err.not_saved"));
      }
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(type: ConnectionType, nameKey: string) {
    setBusy(type);
    try {
      await fetch(`/api/connections/${type}`, { method: "DELETE" });
      toast("info", t(nameKey), t("t.c_off.m"));
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">{t("conn.title")}</h1>
          <p className="bn">{t("conn.subtitle")}</p>
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
                  <h3>{t(p.nameKey)}</h3>
                  <div className="desc bn">{t(p.descKey)}</div>
                </div>
                <div className={`conn-status ${on ? "on" : "off"} bn`}>
                  {on
                    ? t("conn.connected")
                    : p.soon
                      ? t("conn.soon")
                      : t("conn.not_connected")}
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
                          <b>{t("conn.saved")}</b>
                        </div>
                      </>
                    ) : (
                      Object.entries(
                        (conn!.extra_json as Record<string, string>) || {},
                      ).map(([k, v]) => (
                        <div className="kv" key={k}>
                          <span>{k}</span>
                          <b>{v.length > 10 ? t("conn.saved") : v}</b>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="conn-actions">
                    <button
                      className="btn ghost sm bn"
                      onClick={() => disconnect(p.type, p.nameKey)}
                      disabled={busy === p.type}
                    >
                      {t("conn.disconnect")}
                    </button>
                  </div>
                </>
              ) : p.soon ? (
                <>
                  <div className="conn-body bn">
                    <div className="kv">
                      <span>{t("conn.status")}</span>
                      <b>{t("conn.soon_full")}</b>
                    </div>
                  </div>
                  <div className="conn-actions">
                    <button
                      className="btn ghost sm bn"
                      onClick={() => toast("info", t(p.nameKey), t("t.c_soon.m"))}
                    >
                      {t("conn.details")}
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
                          onChange={(e) => setField(p.type, f.key, e.target.value)}
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
                      {busy === p.type ? t("conn.connecting") : t("conn.connect")}
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
