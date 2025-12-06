import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

import { getServiceRoleClient } from "@/lib/supabase/service-client";
import { ROLES } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/supabase/types";
import { requireAdminContext } from "@/lib/auth/admin";

export async function GET() {
  const gate = await requireAdminContext();
  if (gate.status !== 200) {
    return NextResponse.json({ message: gate.message }, { status: gate.status });
  }

  const { data, error } = await gate.supabase
    .from("profiles")
    .select("id, email, full_name, role, timezone, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminContext();
  if (gate.status !== 200) {
    return NextResponse.json({ message: gate.message }, { status: gate.status });
  }

  const body = await request.json();
  const { email, fullName, role } = body as { email: string; fullName?: string; role?: UserRole };

  if (!email || !role || !Object.values(ROLES).includes(role)) {
    return NextResponse.json({ message: "Email and valid role required" }, { status: 400 });
  }

  const service = getServiceRoleClient();
  const password = randomBytes(12).toString("base64url");

  const { data: createdUser, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      enforced_role: role,
    },
  });

  if (createError || !createdUser.user) {
    return NextResponse.json({ message: createError?.message ?? "Unable to create user" }, { status: 400 });
  }

  const { error: profileError } = await gate.supabase.from("profiles").upsert({
    id: createdUser.user.id,
    email,
    full_name: fullName,
    role,
  });

  if (profileError) {
    return NextResponse.json({ message: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Invitation sent" });
}
