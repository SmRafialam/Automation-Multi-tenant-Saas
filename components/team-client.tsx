"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { ROLE_BN } from "@/lib/roles";
import { bnDate } from "@/lib/format";
import type { Member, Role } from "@/lib/types";
import { IconPlus, IconTrash, IconUser } from "@/components/icons";

const ROLE_DESC: Record<Role, string> = {
  owner: "সব কিছুর পূর্ণ নিয়ন্ত্রণ — টিম, কানেকশন, বিলিং",
  manager: "পোস্ট, অর্ডার ও কানেকশন চালাতে পারে (টিম নয়)",
  staff: "শুধু পোস্ট ও অর্ডারের দৈনন্দিন কাজ",
};

export function TeamClient({
  members,
  currentUserId,
}: {
  members: Member[];
  currentUserId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role>("staff");
  const [busy, setBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);

  async function addMember() {
    if (!email.trim()) {
      toast("error", "ইমেইল দিন", "যাকে যোগ করবেন তার ইমেইল লিখুন");
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
        toast("success", "মেম্বার যোগ হয়েছে", `${email} — ${ROLE_BN[role]}`);
        router.refresh();
      } else {
        toast("error", "যোগ করা যায়নি", data.error || "সমস্যা হয়েছে");
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
        toast("success", "রোল আপডেট", ROLE_BN[newRole]);
        router.refresh();
      } else {
        const d = await res.json();
        toast("error", "সমস্যা", d.error || "আপডেট হয়নি");
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
        toast("info", "সরানো হয়েছে", "মেম্বারকে বিজনেস থেকে সরানো হয়েছে");
        router.refresh();
      } else {
        const d = await res.json();
        toast("error", "সমস্যা", d.error || "সরানো যায়নি");
      }
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">টিম ও রোল</h1>
          <p className="bn">
            টিম মেম্বার যোগ করুন এবং কে কী করতে পারবে তা নিয়ন্ত্রণ করুন
          </p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <h3 className="bn">নতুন মেম্বার যোগ করুন</h3>
          </div>
          <div className="form-grid">
            <div>
              <label className="bn">ইমেইল (সে আগে সাইন আপ করা থাকতে হবে)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            <div>
              <label className="bn">রোল</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="manager">ম্যানেজার</option>
                <option value="staff">স্টাফ</option>
              </select>
            </div>
            <button
              className="btn primary bn"
              style={{ justifyContent: "center" }}
              onClick={addMember}
              disabled={busy}
            >
              <IconPlus />
              {busy ? "যোগ হচ্ছে..." : "মেম্বার যোগ করুন"}
            </button>

            <div className="conn-body bn" style={{ marginTop: 4 }}>
              {(["owner", "manager", "staff"] as Role[]).map((r) => (
                <div className="kv" key={r} style={{ alignItems: "flex-start" }}>
                  <span style={{ minWidth: 74, color: "var(--teal)", fontWeight: 600 }}>
                    {ROLE_BN[r]}
                  </span>
                  <b style={{ fontWeight: 400, color: "var(--text-dim)", textAlign: "right" }}>
                    {ROLE_DESC[r]}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="bn">টিম মেম্বার</h3>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>মেম্বার</th>
                  <th>রোল</th>
                  <th>যোগদান</th>
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
                                <span className="cell-sub"> (আপনি)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {isOwner ? (
                          <span className="badge-s s-posted">
                            {ROLE_BN.owner}
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
                            <option value="manager">ম্যানেজার</option>
                            <option value="staff">স্টাফ</option>
                          </select>
                        )}
                      </td>
                      <td className="cell-sub">{bnDate(m.created_at)}</td>
                      <td className="row-act">
                        {!isOwner && (
                          <button
                            className="mini"
                            title="সরান"
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
