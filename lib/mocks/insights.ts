import type { InsightGroup } from "@/lib/types/calendar";

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
