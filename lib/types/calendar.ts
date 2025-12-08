import type { BehaviorType, FieldType, Json } from "@/lib/supabase/types";

export interface CalendarSummary {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  durationDays: number;
}

export interface CalendarDayShape {
  id: string;
  dayNumber: number;
  date: string;
  assignmentTitle: string;
  assignmentSummary?: string | null;
  trackerPrompt?: string | null;
  fields: CalendarFieldTemplate[];
  behaviorMetrics: BehaviorTemplate[];
}

export interface CalendarFieldTemplate {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: FieldType;
  helpText?: string | null;
  isRequired: boolean;
  options?: CalendarFieldOption[];
  dataUnit?: string | null;
}

export interface CalendarFieldOption {
  label: string;
  value: string;
}

export interface BehaviorTemplate {
  id: string;
  metricKey: string;
  metricLabel: string;
  metricType: BehaviorType;
  minValue?: number | null;
  maxValue?: number | null;
  unitLabel?: string | null;
}

export interface DayEntryValue {
  fieldId: string;
  fieldType: FieldType;
  value: Json;
  updatedAt: string;
}

export interface BehaviorLogValue {
  metricId: string;
  valueBoolean?: boolean | null;
  valueNumber?: number | null;
  updatedAt: string;
}

export interface CalendarDayPayload {
  day: CalendarDayShape;
  entries: DayEntryValue[];
  behaviors: BehaviorLogValue[];
}

export interface InsightGroup {
  fieldType: FieldType;
  items: InsightItem[];
}

export interface InsightItem {
  label: string;
  value: string;
  dayNumber: number;
  date: string;
}

export interface TrackerPoint {
  dayNumber: number;
  date: string;
  value: number;
}

export interface TrackerSeries {
  metricKey: string;
  metricLabel: string;
  points: TrackerPoint[];
}

export interface InsightsPayload {
  groups: InsightGroup[];
  trackers: TrackerSeries[];
}
