import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

const missingEnvMessage =
  "Missing SUPABASE_SERVICE_ROLE_KEY. Create one via Supabase dashboard and set it in the environment.";

let serviceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getServiceRoleClient() {
  if (serviceClient) {
    return serviceClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(missingEnvMessage);
  }

  serviceClient = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });

  return serviceClient;
}
