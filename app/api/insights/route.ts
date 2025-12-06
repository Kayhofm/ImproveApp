import { NextResponse } from "next/server";

import { mockInsightGroups } from "@/lib/mocks/insights";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("calendar_entries")
      .select(
        "calendar_day_id, value, field_template:calendar_field_templates(field_label, field_type), day:calendar_days(day_number, day_date)"
      )
      .limit(50)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("No data");
    }

    const grouped = new Map<string, { fieldType: string; items: { label: string; value: string; dayNumber: number; date: string }[] }>();

    data.forEach((row) => {
      const fieldType = row.field_template?.field_type ?? "text";
      const label = row.field_template?.field_label ?? "Field";
      const dayNumber = row.day?.day_number ?? 0;
      const date = row.day?.day_date ?? "";
      const value = typeof row.value === "object" ? JSON.stringify(row.value) : String(row.value ?? "");

      if (!grouped.has(fieldType)) {
        grouped.set(fieldType, { fieldType, items: [] });
      }
      grouped.get(fieldType)?.items.push({ label, value, dayNumber, date });
    });

    return NextResponse.json(Array.from(grouped.values()));
  } catch (error) {
    console.warn("Falling back to mock insights", error);
    return NextResponse.json(mockInsightGroups);
  }
}
