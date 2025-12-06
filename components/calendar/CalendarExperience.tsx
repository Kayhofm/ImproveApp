"use client";

import { useState } from "react";
import { Alert, Box, Stack } from "@mui/material";

import { DayPager } from "@/components/calendar/DayPager";
import { AssignmentCard } from "@/components/calendar/AssignmentCard";
import { DayForm } from "@/components/calendar/DayForm";
import { TrackerCard } from "@/components/calendar/TrackerCard";
import { useCalendarDay } from "@/hooks/useCalendarDay";

const TOTAL_DAYS = 90;

export function CalendarExperience() {
  const [dayNumber, setDayNumber] = useState(1);
  const { data, isLoading, error, saveEntry, saveBehavior } = useCalendarDay(dayNumber);

  if (error) {
    return <Alert severity="error">Failed to load day data</Alert>;
  }

  return (
    <Stack spacing={3}>
      <DayPager currentDay={dayNumber} totalDays={TOTAL_DAYS} onChange={setDayNumber} />
      {isLoading || !data ? (
        <Alert severity="info">Loading day {dayNumber}…</Alert>
      ) : (
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          <Box flex={1} width="100%">
            <Stack spacing={3}>
              <AssignmentCard day={data.day} />
              <DayForm
                dayId={data.day.id}
                fields={data.day.fields}
                entries={data.entries}
                trackerPrompt={data.day.trackerPrompt}
                onSaveField={(payload) => saveEntry.mutateAsync(payload)}
              />
            </Stack>
          </Box>
          <Box flex={1} width="100%">
            <TrackerCard
              dayId={data.day.id}
              metrics={data.day.behaviorMetrics}
              logs={data.behaviors}
              onSaveMetric={(payload) => saveBehavior.mutateAsync(payload)}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
