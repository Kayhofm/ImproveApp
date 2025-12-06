import type { CalendarDayPayload } from "@/lib/types/calendar";
import { getMockDay } from "@/lib/mocks/calendar";

const CALENDAR_ENDPOINT = "/api/calendar";

async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    const response = await fetch(input, init);
    if (!response.ok) throw new Error("Failed to load calendar data");
    return response.json();
  } catch (error) {
    console.warn("Falling back to mock data", error);
    return null;
  }
}

export async function fetchCalendarDay(dayNumber: number): Promise<CalendarDayPayload> {
  const params = new URLSearchParams({ dayNumber: String(dayNumber) });
  const payload = await safeFetch(`${CALENDAR_ENDPOINT}?${params.toString()}`);

  if (!payload) {
    return getMockDay(dayNumber);
  }

  return payload as CalendarDayPayload;
}

export async function upsertDayEntry(payload: {
  dayId: string;
  fieldId: string;
  value: unknown;
}) {
  const response = await fetch(CALENDAR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "upsert-entry",
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to save entry");
  }

  return response.json();
}

export async function upsertBehaviorLog(payload: {
  dayId: string;
  metricId: string;
  value: unknown;
}) {
  const response = await fetch(CALENDAR_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "upsert-behavior",
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to save behavior log");
  }

  return response.json();
}
