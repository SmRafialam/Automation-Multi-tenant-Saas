"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { useToast } from "@/components/toast";
import { bn } from "@/lib/format";
import { can, ROLE_BN, type Permission } from "@/lib/roles";
import type { Role } from "@/lib/types";
import {
  IconBolt,
  IconGrid,
  IconMegaphone,
  IconBag,
  IconLink,
  IconUser,
  IconWhatsapp,
  IconChart,
  IconBell,
  IconHelp,
  IconSearch,
  IconMenu,
} from "@/components/icons";

interface ShellProps {
  business: string;
  plan: string;
  email: string;
  role: Role;
  pendingOrders: number;
  postUsage: number;
  children: React.ReactNode;
}

const NAV: {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  perm: Permission;
  badge?: boolean;
}[] = [
  { href: "/dashboard", label: "ড্যাশবোর্ড", Icon: IconGrid, perm: "view" },
  { href: "/posting", label: "সোশ্যাল পোস্টিং", Icon: IconMegaphone, perm: "manage_posts" },
  { href: "/orders", label: "অর্ডার ও কুরিয়ার", Icon: IconBag, perm: "manage_orders", badge: true },
  { href: "/connections", label: "কানেকশন", Icon: IconLink, perm: "manage_connections" },
  { href: "/team", label: "টিম ও রোল", Icon: IconUser, perm: "manage_team" },
];

export function Shell({
  business,
  plan,
  email,
  role,
  pendingOrders,
  postUsage,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);

  const initials = business
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const soon = () =>
    toast("info", "শীঘ্রই আসছে", "এই ফিচারটি Phase 2-এ পাওয়া যাবে");

  return (
    <div className="shell">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="side-logo">
          <span className="mark">
            <IconBolt />
          </span>
          AutoFlow
        </div>

        <div className="nav-label">Menu</div>
        {NAV.filter((n) => can(role, n.perm)).map(
          ({ href, label, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${pathname === href ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon />
              <span className="bn">{label}</span>
              {badge && pendingOrders > 0 && (
                <span className="badge">{bn(pendingOrders)}</span>
              )}
            </Link>
          ),
        )}

        <div className="nav-label">Phase 2</div>
        <button className="nav-item" onClick={soon}>
          <IconWhatsapp />
          <span className="bn">WhatsApp Bot</span>
        </button>
        <button className="nav-item" onClick={soon}>
          <IconChart />
          <span className="bn">রিপোর্ট</span>
        </button>

        <div className="side-foot">
          <div className="plan-card">
            <div className="row">
              <b style={{ fontSize: 14, textTransform: "capitalize" }}>
                {plan} Plan
              </b>
              <span className="tag bn">{ROLE_BN[role]}</span>
            </div>
            <p className="bn">{bn(postUsage)} / ৫০০ পোস্ট এই মাসে</p>
            <div className="bar">
              <i />
            </div>
            <button
              className="up bn"
              onClick={() =>
                toast("info", "Upgrade", "Pro প্ল্যানে WhatsApp + রিপোর্ট পাবেন")
              }
            >
              Pro-তে আপগ্রেড
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn"
            style={{ display: "grid" }}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <IconMenu />
          </button>
          <div className="search">
            <IconSearch />
            <input placeholder="অর্ডার, পোস্ট বা কাস্টমার খুঁজুন..." />
          </div>
          <div className="top-actions">
            <button
              className="icon-btn"
              onClick={() =>
                toast(
                  "info",
                  "নোটিফিকেশন",
                  `${bn(pendingOrders)}টি অর্ডার অপেক্ষমাণ`,
                )
              }
            >
              <span className="dot" />
              <IconBell />
            </button>
            <button
              className="icon-btn"
              onClick={() => toast("info", "হেল্প", "সাপোর্ট টিম ২৪/৭ আছে")}
            >
              <IconHelp />
            </button>
            <form action={logout}>
              <button type="submit" className="user-chip" title="লগআউট">
                <div className="avatar">{initials || "A"}</div>
                <div className="who">
                  <b>{business}</b>
                  <span>{email}</span>
                </div>
              </button>
            </form>
          </div>
        </header>

        <div className="content fade-in">{children}</div>
      </div>
    </div>
  );
}
