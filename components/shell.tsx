"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/actions";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/lang-provider";
import { LangToggle } from "@/components/lang-toggle";
import { can, type Permission } from "@/lib/roles";
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
  key: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  perm: Permission;
  badge?: boolean;
}[] = [
  { href: "/dashboard", key: "nav.dashboard", Icon: IconGrid, perm: "view" },
  { href: "/posting", key: "nav.posting", Icon: IconMegaphone, perm: "manage_posts" },
  { href: "/orders", key: "nav.orders", Icon: IconBag, perm: "manage_orders", badge: true },
  { href: "/connections", key: "nav.connections", Icon: IconLink, perm: "manage_connections" },
  { href: "/team", key: "nav.team", Icon: IconUser, perm: "manage_team" },
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
  const { t, num } = useLang();
  const [open, setOpen] = React.useState(false);

  const initials = business
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const soon = () => toast("info", t("toast.soon.t"), t("toast.soon.m"));

  return (
    <div className="shell">
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="side-logo">
          <span className="mark">
            <IconBolt />
          </span>
          AutoFlow
        </div>

        <div className="nav-label">{t("nav.menu")}</div>
        {NAV.filter((n) => can(role, n.perm)).map(
          ({ href, key, Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${pathname === href ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon />
              <span className="bn">{t(key)}</span>
              {badge && pendingOrders > 0 && (
                <span className="badge">{num(pendingOrders)}</span>
              )}
            </Link>
          ),
        )}

        <div className="nav-label">Phase 2</div>
        <button className="nav-item" onClick={soon}>
          <IconWhatsapp />
          <span className="bn">{t("nav.whatsapp")}</span>
        </button>
        <button className="nav-item" onClick={soon}>
          <IconChart />
          <span className="bn">{t("nav.reports")}</span>
        </button>

        <div className="side-foot">
          <div className="plan-card">
            <div className="row">
              <b style={{ fontSize: 14, textTransform: "capitalize" }}>
                {plan} {t("plan.suffix")}
              </b>
              <span className="tag bn">{t(`role.${role}`)}</span>
            </div>
            <p className="bn">{t("plan.usage", { used: num(postUsage) })}</p>
            <div className="bar">
              <i />
            </div>
            <button
              className="up bn"
              onClick={() =>
                toast("info", t("toast.upgrade.t"), t("toast.upgrade.m"))
              }
            >
              {t("plan.upgrade")}
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
            <input placeholder={t("topbar.search")} />
          </div>
          <div className="top-actions">
            <LangToggle />
            <button
              className="icon-btn"
              onClick={() =>
                toast(
                  "info",
                  t("toast.notif.t"),
                  t("toast.notif.m", { n: num(pendingOrders) }),
                )
              }
            >
              <span className="dot" />
              <IconBell />
            </button>
            <button
              className="icon-btn"
              onClick={() => toast("info", t("toast.help.t"), t("toast.help.m"))}
            >
              <IconHelp />
            </button>
            <form action={logout}>
              <button type="submit" className="user-chip" title={t("topbar.logout")}>
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
