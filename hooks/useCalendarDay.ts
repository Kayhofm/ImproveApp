"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchCalendarDay, upsertBehaviorLog, upsertDayEntry } from "@/lib/services/calendar-service";
import type { CalendarDayPayload } from "@/lib/types/calendar";

const queryKey = (dayNumber: number) => ["calendar-day", dayNumber];

export function useCalendarDay(dayNumber: number) {
  const client = useQueryClient();

  const query = useQuery<CalendarDayPayload>({
    queryKey: queryKey(dayNumber),
    queryFn: () => fetchCalendarDay(dayNumber),
  });

  const saveEntry = useMutation({
    mutationFn: (payload: { dayId: string; fieldId: string; value: unknown }) =>
      upsertDayEntry(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKey(dayNumber) }),
  });

  const saveBehavior = useMutation({
    mutationFn: (payload: { dayId: string; metricId: string; value: unknown }) =>
      upsertBehaviorLog(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKey(dayNumber) }),
  });

  return {
    ...query,
    saveEntry,
    saveBehavior,
  };
}
