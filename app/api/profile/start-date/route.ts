import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function normalizeDateOnly(value: string | null | undefined) {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("program_start_date")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ startDate: data?.program_start_date ?? null });
  } catch (error) {
    console.error("Failed to load start date", error);
    return NextResponse.json({ message: "Unable to load start date" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const normalized = normalizeDateOnly(body?.startDate);

    if (body?.startDate && !normalized) {
      return NextResponse.json({ message: "Start date must be YYYY-MM-DD" }, { status: 400 });
    }

    const { error } = await supabase.from("profiles").update({ program_start_date: normalized }).eq("id", user.id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ startDate: normalized });
  } catch (error) {
    console.error("Failed to update start date", error);
    return NextResponse.json({ message: "Unable to update start date" }, { status: 500 });
  }
}
