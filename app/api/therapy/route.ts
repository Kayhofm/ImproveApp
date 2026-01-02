import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/types";

type TherapyRow = Database["public"]["Tables"]["therapy_sessions"]["Row"];

function normalizeSessionNumber(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  const sessionNumber = normalizeSessionNumber(request.nextUrl.searchParams.get("sessionNumber"));
  if (!sessionNumber) {
    return NextResponse.json({ message: "sessionNumber is required" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("therapy_sessions")
    .select("session_number, session_date, therapist, summary, session_summary")
    .eq("user_id", user.id)
    .eq("session_number", sessionNumber)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    note: data
      ? {
          sessionNumber: data.session_number,
          date: data.session_date,
          therapist: data.therapist,
          summary: data.session_summary,
          details: data.summary,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionNumber = normalizeSessionNumber(String(body?.sessionNumber ?? ""));

  if (!sessionNumber) {
    return NextResponse.json({ message: "sessionNumber must be a positive integer" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const normalized: Pick<TherapyRow, "session_date" | "therapist" | "summary"> = {
    session_date: body?.date || null,
    therapist: body?.therapist || null,
    summary: body?.details || "",
  };
  const sessionSummary: TherapyRow["session_summary"] = body?.summary || "";

  const hasContent = Boolean(
    normalized.session_date || normalized.therapist || normalized.summary?.trim() || sessionSummary?.trim()
  );

  if (!hasContent) {
    const { error: deleteError } = await supabase
      .from("therapy_sessions")
      .delete()
      .eq("user_id", user.id)
      .eq("session_number", sessionNumber);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ note: null });
  }

  const payload: Database["public"]["Tables"]["therapy_sessions"]["Insert"] = {
    user_id: user.id,
    session_number: sessionNumber,
    session_summary: sessionSummary,
    ...normalized,
  };

  const { data, error } = await supabase
    .from("therapy_sessions")
    .upsert(payload, { onConflict: "user_id,session_number" })
    .select("session_number, session_date, therapist, summary, session_summary")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    note: data
      ? {
          sessionNumber: data.session_number,
          date: data.session_date,
          therapist: data.therapist,
          summary: data.session_summary,
          details: data.summary,
        }
      : null,
  });
}
