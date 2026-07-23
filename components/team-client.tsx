"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/lang-provider";
import { dateFmt, translate } from "@/lib/i18n";
import type { Member, Role } from "@/lib/types";
import { IconPlus, IconTrash, IconUser } from "@/components/icons";

export function TeamClient({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const { t, lang } = useLang();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("staff");
  const [busy, setBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);

  async function addMember() {
    if (!email.trim()) {
      toast("error", t("t.t_email.t"), t("t.t_email.m"));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmail("");
        toast("success", t("t.t_added.t"), `${email} — ${translate(lang, `role.${role}`)}`);
        router.refresh();
      } else {
        toast("error", t("t.t_addfail.t"), data.error || t("err.title"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(userId: string, newRole: Role) {
    setRowBusy(userId);
    try {
      const res = await fetch(`/api/team/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast("success", t("t.t_role.t"), translate(lang, `role.${newRole}`));
        router.refresh();
      } else {
        const d = await res.json();
        toast("error", t("err.title"), d.error || t("err.not_saved"));
      }
    } finally {
      setRowBusy(null);
    }
  }

  async function removeMember(userId: string) {
    setRowBusy(userId);
    try {
      const res = await fetch(`/api/team/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast("info", t("t.t_removed.t"), t("t.t_removed.m"));
        router.refresh();
      } else {
        const d = await res.json();
        toast("error", t("err.title"), d.error || t("err.not_saved"));
      }
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">{t("team.title")}</h1>
          <p className="bn">{t("team.subtitle")}</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <h3 className="bn">{t("team.add")}</h3>
          </div>
          <div className="form-grid">
            <div>
              <label className="bn">{t("team.email_label")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            <div>
              <label className="bn">{t("team.role_label")}</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="manager">{translate(lang, "role.manager")}</option>
                <option value="staff">{translate(lang, "role.staff")}</option>
              </select>
            </div>
            <button
              className="btn primary bn"
              style={{ justifyContent: "center" }}
              onClick={addMember}
              disabled={busy}
            >
              <IconPlus />
              {busy ? t("team.adding") : t("team.add_btn")}
            </button>

            <div className="conn-body bn" style={{ marginTop: 4 }}>
              {(["owner", "manager", "staff"] as Role[]).map((r) => (
                <div className="kv" key={r} style={{ alignItems: "flex-start" }}>
                  <span style={{ minWidth: 74, color: "var(--teal)", fontWeight: 600 }}>
                    {translate(lang, `role.${r}`)}
                  </span>
                  <b style={{ fontWeight: 400, color: "var(--text-dim)", textAlign: "right" }}>
                    {t(`team.desc.${r}`)}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="bn">{t("team.members")}</h3>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("th.member")}</th>
                  <th>{t("th.role")}</th>
                  <th>{t("th.joined")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isOwner = m.role === "owner";
                  const isSelf = m.user_id === currentUserId;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="cell-media">
                          <div className="thumb">
                            <IconUser width={16} />
                          </div>
                          <div>
                            <div className="cell-main">
                              {m.email || "—"}
                              {isSelf && (
                                <span className="cell-sub">{t("team.you")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isOwner ? (
                          <span className="badge-s s-posted">
                            {translate(lang, "role.owner")}
                          </span>
                        ) : (
                          <select
                            value={m.role}
                            disabled={rowBusy === m.user_id}
                            onChange={(e) =>
                              changeRole(m.user_id, e.target.value as Role)
                            }
                            style={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              padding: "6px 10px",
                              borderRadius: 8,
                              fontSize: 13,
                            }}
                          >
                            <option value="manager">{translate(lang, "role.manager")}</option>
                            <option value="staff">{translate(lang, "role.staff")}</option>
                          </select>
                        )}
                      </td>
                      <td className="cell-sub">
                        {dateFmt(m.created_at, lang, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="row-act">
                        {!isOwner && (
                          <button
                            className="mini"
                            onClick={() => removeMember(m.user_id)}
                            disabled={rowBusy === m.user_id}
                          >
                            <IconTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
