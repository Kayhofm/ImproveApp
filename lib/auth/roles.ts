import type { UserRole } from "@/lib/supabase/types";

export const ROLES = {
  admin: "admin",
  editor: "editor",
  viewer: "viewer",
} as const satisfies Record<string, UserRole>;

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export function canEdit(role: UserRole | null | undefined) {
  return role === ROLES.admin || role === ROLES.editor;
}

export function isAdmin(role: UserRole | null | undefined) {
  return role === ROLES.admin;
}

export function guardRole(role: UserRole | null | undefined, allowed: UserRole[]) {
  if (!role || !allowed.includes(role)) {
    throw new Error("Insufficient permissions for this action.");
  }
}
