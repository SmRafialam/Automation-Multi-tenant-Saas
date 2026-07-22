import type { Role } from "@/lib/types";

export type Permission =
  | "view"
  | "manage_posts"
  | "manage_orders"
  | "manage_connections"
  | "manage_team";

/**
 * Role → permission matrix.
 *  - owner   : full control (team, connections, everything)
 *  - manager : run the shop (posts, orders, connections) but not the team
 *  - staff   : day-to-day posts & orders only
 */
const MATRIX: Record<Role, Permission[]> = {
  owner: [
    "view",
    "manage_posts",
    "manage_orders",
    "manage_connections",
    "manage_team",
  ],
  manager: ["view", "manage_posts", "manage_orders", "manage_connections"],
  staff: ["view", "manage_posts", "manage_orders"],
};

export function can(role: Role | null, perm: Permission): boolean {
  if (!role) return false;
  return MATRIX[role]?.includes(perm) ?? false;
}

export const ROLE_BN: Record<Role, string> = {
  owner: "মালিক",
  manager: "ম্যানেজার",
  staff: "স্টাফ",
};
