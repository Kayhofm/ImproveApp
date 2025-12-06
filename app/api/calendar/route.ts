import { NextResponse, type NextRequest } from "next/server";

import { getMockDay } from "@/lib/mocks/calendar";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/lib/supabase/types";

type FieldTemplateRow = Database["public"]["Tables"]["calendar_field_templates"]["Row"]; 
type BehaviorTemplateRow = Database["public"]["Tables"]["calendar_behavior_templates"]["Row"]; 
type CalendarEntryRow = Database["public"]["Tables"]["calendar_entries"]["Row"]; 
type BehaviorLogRow = Database["public"]["Tables"]["behavior_logs"]["Row"]; 

async function getDayPayload(dayNumber: number, userId?: string) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const activeUserId = userId ?? user?.id;

    const { data: day, error: dayError } = await supabase
      .from("calendar_days")
      .select("id, calendar_id, day_number, day_date, assignment_title, assignment_summary, tracker_prompt")
      .eq("day_number", dayNumber)
      .order("day_number")
      .limit(1)
      .maybeSingle();

    if (dayError || !day) {
      throw dayError ?? new Error("Day not found");
    }

    const { data: fields } = await supabase
      .from("calendar_field_templates")
      .select("*")
      .eq("calendar_day_id", day.id)
      .order("order_index", { ascending: true });

    const { data: behaviors } = await supabase
      .from("calendar_behavior_templates")
      .select("*")
      .eq("calendar_id", day.calendar_id)
      .order("metric_key");

    const { data: entries } = activeUserId
      ? await supabase
          .from("calendar_entries")
          .select("id, field_template_id, value, updated_at")
          .eq("calendar_day_id", day.id)
          .eq("user_id", activeUserId)
      : { data: [] };

    const { data: behaviorLogs } = activeUserId
      ? await supabase
          .from("behavior_logs")
          .select("id, behavior_template_id, boolean_value, numeric_value, created_at")
          .eq("calendar_day_id", day.id)
          .eq("user_id", activeUserId)
      : { data: [] };

    const typedFields = (fields ?? []) as FieldTemplateRow[];
    const typedBehaviors = (behaviors ?? []) as BehaviorTemplateRow[];
    const typedEntries = (entries ?? []) as CalendarEntryRow[];
    const typedLogs = (behaviorLogs ?? []) as BehaviorLogRow[];

    const fieldTypeMap = new Map(typedFields.map((field) => [field.id, field.field_type]));

    return {
      day: {
        id: day.id,
        dayNumber: day.day_number,
        date: day.day_date,
        assignmentTitle: day.assignment_title,
        assignmentSummary: day.assignment_summary,
        trackerPrompt: day.tracker_prompt,
        fields: typedFields.map((field) => ({
          id: field.id,
          fieldKey: field.field_key,
          fieldLabel: field.field_label,
          fieldType: field.field_type,
          helpText: field.help_text,
          isRequired: field.is_required,
          options: (field.options as { label: string; value: string }[]) ?? undefined,
          dataUnit: field.data_unit,
        })),
        behaviorMetrics: typedBehaviors.map((metric) => ({
          id: metric.id,
          metricKey: metric.metric_key,
          metricLabel: metric.metric_label,
          metricType: metric.metric_type,
          minValue: metric.min_value,
          maxValue: metric.max_value,
          unitLabel: metric.unit_label,
        })),
      },
      entries: typedEntries.map((entry) => ({
        fieldId: entry.field_template_id,
        fieldType: fieldTypeMap.get(entry.field_template_id) ?? "short_text",
        value: entry.value,
        updatedAt: entry.updated_at,
      })),
      behaviors: typedLogs.map((log) => ({
        metricId: log.behavior_template_id,
        valueBoolean: log.boolean_value,
        valueNumber: log.numeric_value,
        updatedAt: log.created_at,
      })),
    };
  } catch (error) {
    console.warn("Supabase unavailable, using mock day", error);
    return getMockDay(dayNumber);
  }
}

export async function GET(request: NextRequest) {
  const dayNumber = Number(request.nextUrl.searchParams.get("dayNumber") ?? 1);
  const payload = await getDayPayload(dayNumber);
  return NextResponse.json(payload);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (body.action === "upsert-entry") {
      const { dayId, fieldId, value } = body;
      const payload: Database["public"]["Tables"]["calendar_entries"]["Insert"] = {
        calendar_day_id: dayId,
        field_template_id: fieldId,
        user_id: user.id,
        value,
      };
      const { error } = await supabase
        .from("calendar_entries")
        .upsert(payload, { onConflict: "calendar_day_id,field_template_id,user_id" });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: "Saved" });
    }

    if (body.action === "upsert-behavior") {
      const { dayId, metricId, value } = body;
      const normalized = typeof value === "boolean" ? { boolean_value: value } : { numeric_value: value };
      const payload: Database["public"]["Tables"]["behavior_logs"]["Insert"] = {
        calendar_day_id: dayId,
        behavior_template_id: metricId,
        user_id: user.id,
        ...normalized,
      };
      const { error } = await supabase
        .from("behavior_logs")
        .upsert(payload, { onConflict: "calendar_day_id,behavior_template_id,user_id" });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      return NextResponse.json({ message: "Saved" });
    }

    return NextResponse.json({ message: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Calendar write failed", error);
    return NextResponse.json({ message: "Server not configured for Supabase" }, { status: 500 });
  }
}
