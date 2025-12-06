import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { ROLES } from "@/lib/auth/roles";
import type { ProfileSummary } from "@/lib/types/user";

export async function requireAdminContext() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: 401 as const, message: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, timezone, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== ROLES.admin) {
    return { status: 403 as const, message: "Admins only" };
  }

  const summary: ProfileSummary = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    timezone: profile.timezone,
    createdAt: profile.created_at,
  };

  return { status: 200 as const, supabase, profile: summary };
}
