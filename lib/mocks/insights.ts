import type { InsightGroup, InsightsPayload, TrackerSeries } from "@/lib/types/calendar";

export const mockInsightGroups: InsightGroup[] = [
  {
    fieldType: "number",
    items: [
      { label: "Daily score", value: "8 / 10", dayNumber: 1, date: "2025-01-01" },
      { label: "Daily score", value: "7 / 10", dayNumber: 2, date: "2025-01-02" },
    ],
  },
  {
    fieldType: "boolean",
    items: [
      { label: "Habit completed", value: "Yes", dayNumber: 1, date: "2025-01-01" },
      { label: "Habit completed", value: "No", dayNumber: 2, date: "2025-01-02" },
    ],
  },
];

export const mockTrackerSeries: TrackerSeries[] = [
  {
    metricKey: "confidence",
    metricLabel: "Confidence",
    points: [
      { dayNumber: 1, date: "2025-01-01", value: 6 },
      { dayNumber: 2, date: "2025-01-02", value: 7 },
      { dayNumber: 3, date: "2025-01-03", value: 5 },
    ],
  },
  {
    metricKey: "consistency",
    metricLabel: "Consistency",
    points: [
      { dayNumber: 1, date: "2025-01-01", value: 4 },
      { dayNumber: 2, date: "2025-01-02", value: 6 },
      { dayNumber: 3, date: "2025-01-03", value: 7 },
    ],
  },
  {
    metricKey: "joy",
    metricLabel: "Joy",
    points: [
      { dayNumber: 1, date: "2025-01-01", value: 5 },
      { dayNumber: 2, date: "2025-01-02", value: 4 },
      { dayNumber: 3, date: "2025-01-03", value: 6 },
    ],
  },
];

export const mockInsightsPayload: InsightsPayload = {
  groups: mockInsightGroups,
  trackers: mockTrackerSeries,
};
