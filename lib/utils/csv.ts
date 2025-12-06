import { randomUUID } from "node:crypto";
import Papa from "papaparse";

import type { BehaviorTemplate, CalendarDayShape, CalendarFieldTemplate } from "@/lib/types/calendar";

interface CsvDayRow {
  day_number: string;
  assignment_title: string;
  assignment_summary?: string;
  tracker_prompt?: string;
  [key: string]: string | undefined;
}

interface FieldColumnSet {
  key?: string;
  label?: string;
  type?: string;
  required?: string;
  options?: string;
  source: "field" | "tracker";
  order: number;
}

const behaviorTypes: ReadonlySet<BehaviorTemplate["metricType"]> = new Set(["boolean", "number", "scale"]);

function cleanString(value?: string) {
  return value?.trim() ?? undefined;
}

function parseOptions(raw?: string) {
  if (!raw) return undefined;
  const normalized = raw.trim();
  if (!normalized.includes("|") && !normalized.includes(",")) {
    return undefined;
  }
  return normalized
    .split(/[|,]/)
    .map((option) => option.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      value: label.toLowerCase().replace(/\s+/g, "_"),
    }));
}

function parseBoolean(raw?: string) {
  if (!raw) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "true" || normalized === "t" || normalized === "1";
}

function parseTrackerRange(raw?: string) {
  if (!raw) return {};
  const values = raw
    .split("|")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return {};
  return {
    minValue: Math.min(...values),
    maxValue: Math.max(...values),
  };
}

const COLUMN_PATTERN = /^(field|tracker)_(key|label|type|required|options)(_(\d+))?$/;

function collectFieldSegments(row: CsvDayRow, headers: string[]) {
  const relevantColumns = headers.filter((column) => COLUMN_PATTERN.test(column));
  const sequence = relevantColumns.map((column) => {
    const match = column.match(COLUMN_PATTERN);
    const suffixMatch = column.match(/_(\d+)$/);
    return {
      value: cleanString(row[column]),
      prefix: match?.[1] === "tracker" ? "tracker" : "field",
      suffixIndex: suffixMatch ? Number(suffixMatch[1]) : 1,
    };
  });

  const segments: FieldColumnSet[] = [];
  let cursor = 0;

  const looksLikeOptions = (value?: string) => Boolean(value && (value.includes("|") || value.includes(",")));

  while (cursor < sequence.length) {
    const keyMeta = sequence[cursor++];
    if (!keyMeta?.value) {
      continue;
    }

    const labelMeta = sequence[cursor++] ?? {};
    const typeMeta = sequence[cursor++] ?? {};
    const requiredMeta = sequence[cursor++] ?? {};

    let optionsMeta: typeof keyMeta | undefined;
    const peek = sequence[cursor];
    if (looksLikeOptions(peek?.value)) {
      optionsMeta = peek;
      cursor += 1;
    }

    const consumed = [keyMeta, labelMeta, typeMeta, requiredMeta, optionsMeta].filter(Boolean) as typeof keyMeta[];
    const hasTrackerPrefix = consumed.some((meta) => meta.prefix === "tracker");
    const highestSuffix = Math.max(...consumed.map((meta) => meta.suffixIndex ?? 1));
    const source: FieldColumnSet["source"] = hasTrackerPrefix || highestSuffix > 1 ? "tracker" : segments.length === 0 ? "field" : "tracker";

    segments.push({
      key: keyMeta.value,
      label: labelMeta.value ?? keyMeta.value,
      type: typeMeta.value ?? "short_text",
      required: requiredMeta.value,
      options: optionsMeta?.value,
      source,
      order: segments.length,
    });
  }

  return segments;
}

export function parseCalendarCsv(csv: string) {
  const result = Papa.parse<CsvDayRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length) {
    throw new Error(result.errors[0].message);
  }

  const headers = result.meta.fields ?? [];
  const grouped = new Map<number, CalendarDayShape>();

  for (const row of result.data) {
    const dayNumber = Number(row.day_number);
    if (!dayNumber) continue;

    const existing = grouped.get(dayNumber);
    const fields = [...(existing?.fields ?? [])];
    const behaviorMetrics = [...(existing?.behaviorMetrics ?? [])];

    const upsertField = (template: CalendarFieldTemplate) => {
      if (!template.fieldKey) return;
      if (!fields.some((field) => field.fieldKey === template.fieldKey)) {
        fields.push(template);
      }
    };

    const upsertBehavior = (metric: BehaviorTemplate) => {
      if (!metric.metricKey) return;
      if (!behaviorMetrics.some((existingMetric) => existingMetric.metricKey === metric.metricKey)) {
        behaviorMetrics.push(metric);
      }
    };

    const fieldSegments = collectFieldSegments(row, headers);

    fieldSegments.forEach((segment) => {
      if (!segment.key) return;

      const normalizedType = (segment.type as CalendarFieldTemplate["fieldType"]) ?? "short_text";
      const template: CalendarFieldTemplate = {
        id: randomUUID(),
        fieldKey: segment.key,
        fieldLabel: segment.label ?? segment.key,
        fieldType: normalizedType,
        isRequired: parseBoolean(segment.required),
        options: parseOptions(segment.options),
      };

      const metricType = segment.type as BehaviorTemplate["metricType"];
      const shouldBeTracker = segment.source === "tracker";

      if (shouldBeTracker && behaviorTypes.has(metricType)) {
        const range = parseTrackerRange(segment.options);
        const metric: BehaviorTemplate = {
          id: randomUUID(),
          metricKey: segment.key,
          metricLabel: segment.label ?? segment.key,
          metricType,
          minValue: range.minValue,
          maxValue: range.maxValue,
          unitLabel: null,
        };
        upsertBehavior(metric);
        return;
      }

      upsertField(template);
    });

    grouped.set(dayNumber, {
      id: existing?.id ?? randomUUID(),
      dayNumber,
      date: existing?.date ?? new Date().toISOString(),
      assignmentTitle: row.assignment_title ?? existing?.assignmentTitle ?? "",
      assignmentSummary: row.assignment_summary ?? existing?.assignmentSummary ?? null,
      trackerPrompt: row.tracker_prompt ?? existing?.trackerPrompt ?? null,
      fields,
      behaviorMetrics,
    });
  }

  return Array.from(grouped.values()).sort((a, b) => a.dayNumber - b.dayNumber);
}
