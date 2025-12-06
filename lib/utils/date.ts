import { format, addDays, parseISO } from "date-fns";

export function formatDisplayDate(date: string | Date) {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "EEE, MMM d");
}

export function getDateFromStart(start: string, dayNumber: number) {
  return addDays(parseISO(start), dayNumber - 1).toISOString();
}
