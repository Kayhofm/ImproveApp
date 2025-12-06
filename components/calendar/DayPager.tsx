"use client";

import { Pagination, Stack, Typography, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface DayPagerProps {
  currentDay: number;
  totalDays?: number;
  onChange: (day: number) => void;
}

const DEFAULT_TOTAL = 90;

export function DayPager({ currentDay, onChange, totalDays = DEFAULT_TOTAL }: DayPagerProps) {
  const handleNext = () => {
    if (currentDay < totalDays) onChange(currentDay + 1);
  };

  const handlePrev = () => {
    if (currentDay > 1) onChange(currentDay - 1);
  };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton onClick={handlePrev} disabled={currentDay === 1}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="subtitle1">Day {currentDay}</Typography>
        <IconButton onClick={handleNext} disabled={currentDay === totalDays}>
          <ArrowForwardIcon />
        </IconButton>
      </Stack>
      <Pagination
        size="small"
        count={totalDays}
        siblingCount={1}
        boundaryCount={1}
        page={currentDay}
        onChange={(_, value) => onChange(value)}
      />
    </Stack>
  );
}
