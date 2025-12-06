import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  const role = profile?.role ?? ROLES.viewer;

  return <AppShell role={role} profile={profile}>{children}</AppShell>;
}
