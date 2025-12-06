import { addDays, formatISO } from "date-fns";

import type { CalendarDayPayload } from "@/lib/types/calendar";

const today = new Date();

export const mockCalendarPayloads: CalendarDayPayload[] = Array.from({ length: 5 }).map(
  (_, index) => {
    const date = addDays(today, index);
    const iso = formatISO(date, { representation: "date" });
    return {
      day: {
        id: `day-${index + 1}`,
        dayNumber: index + 1,
        date: iso,
        assignmentTitle: `Assignment ${index + 1}`,
        assignmentSummary: "Describe the focus for the day.",
        trackerPrompt: "Did you complete the habit today?",
        fields: [
          {
            id: `field-${index + 1}-1`,
            fieldKey: "reflection",
            fieldLabel: "Reflection",
            fieldType: "long_text",
            isRequired: true,
          },
          {
            id: `field-${index + 1}-2`,
            fieldKey: "score",
            fieldLabel: "Score",
            fieldType: "number",
            isRequired: false,
            dataUnit: "pts",
          },
          {
            id: `field-${index + 1}-3`,
            fieldKey: "mood",
            fieldLabel: "Mood",
            fieldType: "select",
            isRequired: false,
            options: [
              { label: "Energized", value: "energized" },
              { label: "Neutral", value: "neutral" },
              { label: "Tired", value: "tired" },
            ],
          },
        ],
        behaviorMetrics: [
          {
            id: `behavior-${index + 1}-1`,
            metricKey: "habit",
            metricLabel: "Habit completed",
            metricType: "boolean",
          },
          {
            id: `behavior-${index + 1}-2`,
            metricKey: "energy",
            metricLabel: "Energy",
            metricType: "scale",
            minValue: 1,
            maxValue: 5,
          },
        ],
      },
      entries: [],
      behaviors: [],
    };
  }
);

export function getMockDay(dayNumber: number) {
  return (
    mockCalendarPayloads.find((payload) => payload.day.dayNumber === dayNumber) ??
    mockCalendarPayloads[0]
  );
}
