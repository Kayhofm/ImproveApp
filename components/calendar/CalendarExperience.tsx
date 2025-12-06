"use client";

import { useState } from "react";
import { Alert, Box, Stack, TextField } from "@mui/material";

import { DayPager } from "@/components/calendar/DayPager";
import { AssignmentCard } from "@/components/calendar/AssignmentCard";
import { DayForm } from "@/components/calendar/DayForm";
import { TrackerCard } from "@/components/calendar/TrackerCard";
import { useCalendarDay } from "@/hooks/useCalendarDay";
import { useProgramStartDate } from "@/hooks/useProgramStartDate";
import { formatDisplayDate, getDateFromStart } from "@/lib/utils/date";

const TOTAL_DAYS = 90;

export function CalendarExperience() {
  const [dayNumber, setDayNumber] = useState(1);
  const { data, isLoading, error, saveEntry, saveBehavior } = useCalendarDay(dayNumber);
  const {
    data: startDateResponse,
    isLoading: isStartDateLoading,
    updateStartDate,
    error: startDateError,
  } = useProgramStartDate();
  const startDateValue = startDateResponse?.startDate ?? (dayNumber === 1 && data?.day.date ? data.day.date : "");

  let currentDateLabel: string | undefined;
  if (startDateResponse?.startDate) {
    try {
      currentDateLabel = formatDisplayDate(getDateFromStart(startDateResponse.startDate, dayNumber));
    } catch (formatError) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Unable to format calendar date", formatError);
      }
    }
  } else if (data?.day.date) {
    currentDateLabel = formatDisplayDate(data.day.date);
  }

  if (error) {
    return <Alert severity="error">Failed to load day data</Alert>;
  }

  return (
    <Stack spacing={3}>
      <DayPager
        currentDay={dayNumber}
        totalDays={TOTAL_DAYS}
        onChange={setDayNumber}
        dateLabel={currentDateLabel}
      />
      {dayNumber === 1 ? (
        <TextField
          label="Day 1 date"
          type="date"
          value={startDateValue}
          onChange={(event) => updateStartDate.mutate(event.target.value || null)}
          InputLabelProps={{ shrink: true }}
          required
          disabled={isStartDateLoading || updateStartDate.isPending}
          error={Boolean(updateStartDate.error)}
          helperText={
            updateStartDate.error
              ? updateStartDate.error.message
              : startDateValue
                ? "Stored for your account in Supabase"
                : "Select a start date to personalize your calendar"
          }
          sx={{ maxWidth: 260 }}
        />
      ) : null}
      {startDateError && <Alert severity="error">{startDateError.message}</Alert>}
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
