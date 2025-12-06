import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/lib/supabase/types";

const missingEnvMessage =
  "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to your .env.local file.";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(missingEnvMessage);
  }

  return createBrowserClient<Database>(url, anonKey);
}
