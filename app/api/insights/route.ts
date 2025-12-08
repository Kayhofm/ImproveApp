import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { TrackerSeries } from "@/lib/types/calendar";
import { getDateFromStart } from "@/lib/utils/date";

type TrackerRow = {
  numeric_value: number | null;
  boolean_value: boolean | null;
  behavior_template: { metric_key: string; metric_label: string | null } | null;
  day: { day_number: number; day_date: string } | null;
  created_at: string;
};

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("program_start_date")
      .eq("id", user.id)
      .maybeSingle();

    const programStartDate = profile?.program_start_date ?? null;

    const { data, error } = await supabase
      .from("calendar_entries")
      .select(
        "calendar_day_id, value, field_template:calendar_field_templates(field_label, field_type), day:calendar_days(day_number, day_date)"
      )
      .eq("user_id", user.id)
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
    const groups = Array.from(grouped.values());

    const { data: trackerRows, error: trackerError } = await supabase
      .from("behavior_logs")
      .select(
        "numeric_value, boolean_value, created_at, behavior_template:calendar_behavior_templates(metric_key, metric_label), day:calendar_days(day_number, day_date)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(300);
    const trackerMap = new Map<string, TrackerSeries>();

    if (trackerError) {
      console.warn("Unable to load tracker series", trackerError.message);
    } else {
      (trackerRows as TrackerRow[] | null | undefined)?.forEach((row) => {
        const metricKey = row.behavior_template?.metric_key ?? "tracker";
        const metricLabel = row.behavior_template?.metric_label ?? metricKey;
        const value =
          row.numeric_value ??
          (typeof row.boolean_value === "boolean" ? (row.boolean_value ? 1 : 0) : null);

        if (value === null) {
          return;
        }

        const dayNumber = row.day?.day_number ?? 0;
        const date =
          programStartDate && dayNumber
            ? getDateFromStart(programStartDate, dayNumber)
            : row.day?.day_date ?? row.created_at ?? "";

        if (!trackerMap.has(metricKey)) {
          trackerMap.set(metricKey, {
            metricKey,
            metricLabel,
            points: [],
          });
        }

        trackerMap.get(metricKey)?.points.push({ dayNumber, date, value: Number(value) });
      });
    }

    const trackers = Array.from(trackerMap.values()).map((series) => ({
      ...series,
      points: series.points.sort((a, b) => a.dayNumber - b.dayNumber),
    }));

    return NextResponse.json({ groups, trackers });
  } catch (error) {
    console.error("Insights API failed", error);
    return NextResponse.json({ message: "Insights are unavailable right now." }, { status: 500 });
  }
}
