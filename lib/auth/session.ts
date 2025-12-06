import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ProfileSummary } from "@/lib/types/user";
import { ROLES } from "@/lib/auth/roles";

export const getCurrentProfile = cache(async (): Promise<ProfileSummary | null> => {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, timezone, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role ?? ROLES.viewer,
      timezone: data.timezone,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.warn("Supabase session lookup failed", error);
    return null;
  }
});
