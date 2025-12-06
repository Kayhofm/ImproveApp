import { Metadata } from "next";
import { Alert } from "@mui/material";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getCurrentProfile } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Admin • Improve 90",
};

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== ROLES.admin) {
    return <Alert severity="warning">Only admins can view this area.</Alert>;
  }

  return <AdminDashboard />;
}
