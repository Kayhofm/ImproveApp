import type { UserRole } from "@/lib/supabase/types";

export interface ProfileSummary {
  id: string;
  email: string;
  fullName?: string | null;
  role: UserRole;
  timezone?: string | null;
  createdAt: string;
}
