import { NextResponse, type NextRequest } from "next/server";

import { requireAdminContext } from "@/lib/auth/admin";
import { parseCalendarCsv } from "@/lib/utils/csv";
import { getDateFromStart } from "@/lib/utils/date";
import type { Json } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  const gate = await requireAdminContext();
  if (gate.status !== 200) {
    return NextResponse.json({ message: gate.message }, { status: gate.status });
  }

  const formData = await request.formData();
  const file = formData.get("calendar");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "CSV file is required" }, { status: 400 });
  }

  const csvContent = await file.text();
  const days = parseCalendarCsv(csvContent);

  if (!days.length) {
    return NextResponse.json({ message: "No rows detected" }, { status: 400 });
  }

  const slug = (formData.get("slug") as string) || "default";
  const title = (formData.get("title") as string) || "Core 90";
  const description = (formData.get("description") as string) || "Seeded via CSV";
  const startDate = days[0]?.date ?? new Date().toISOString();

  const { data: calendar, error: calendarError } = await gate.supabase
    .from("calendars")
    .upsert(
      {
        slug,
        title,
        description,
        start_date: startDate,
        duration_days: 90,
        is_active: true,
        created_by: gate.profile.id,
      },
      { onConflict: "slug" }
    )
    .select("id, start_date")
    .maybeSingle();

  if (calendarError || !calendar) {
    return NextResponse.json({ message: calendarError?.message ?? "Unable to upsert calendar" }, { status: 400 });
  }

  const behaviorRegistry = new Map<string, typeof days[number]["behaviorMetrics"][number]>();

  for (const day of days) {
    const resolvedDate = day.date ?? getDateFromStart(calendar.start_date, day.dayNumber);

    const { data: dayRecord, error: dayError } = await gate.supabase
      .from("calendar_days")
      .upsert(
        {
          calendar_id: calendar.id,
          day_number: day.dayNumber,
          day_date: resolvedDate,
          assignment_title: day.assignmentTitle,
          assignment_summary: day.assignmentSummary,
          tracker_prompt: day.trackerPrompt,
        },
        { onConflict: "calendar_id,day_number" }
      )
      .select("id")
      .maybeSingle();

    if (dayError || !dayRecord) {
      return NextResponse.json({ message: dayError?.message ?? "Unable to upsert day" }, { status: 400 });
    }

    await gate.supabase.from("calendar_field_templates").delete().eq("calendar_day_id", dayRecord.id);

    if (day.fields.length) {
      const fieldPayload = day.fields.map((field, index) => ({
        calendar_day_id: dayRecord.id,
        field_key: field.fieldKey,
        field_label: field.fieldLabel,
        field_type: field.fieldType,
        help_text: field.helpText,
        is_required: field.isRequired,
        options: (field.options ?? null) as Json,
        order_index: index,
        data_unit: field.dataUnit,
      }));
      const { error: fieldError } = await gate.supabase.from("calendar_field_templates").insert(fieldPayload);
      if (fieldError) {
        return NextResponse.json({ message: fieldError.message }, { status: 400 });
      }
    }

    day.behaviorMetrics.forEach((metric) => {
      if (!behaviorRegistry.has(metric.metricKey)) {
        behaviorRegistry.set(metric.metricKey, metric);
      }
    });
  }

  await gate.supabase.from("calendar_behavior_templates").delete().eq("calendar_id", calendar.id);

  if (behaviorRegistry.size) {
    const { error: behaviorError } = await gate.supabase.from("calendar_behavior_templates").insert(
      Array.from(behaviorRegistry.values()).map((metric) => ({
        calendar_id: calendar.id,
        metric_key: metric.metricKey,
        metric_label: metric.metricLabel,
        metric_type: metric.metricType,
        unit_label: metric.unitLabel,
        min_value: metric.minValue,
        max_value: metric.maxValue,
      }))
    );

    if (behaviorError) {
      return NextResponse.json({ message: behaviorError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ message: "Calendar imported", days: days.length });
}
