import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";

import type { CalendarDayShape } from "@/lib/types/calendar";

interface AssignmentCardProps {
  day: CalendarDayShape;
}

export function AssignmentCard({ day }: AssignmentCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{day.assignmentTitle}</Typography>
            <Chip label={`Day ${day.dayNumber}`} color="primary" />
          </Stack>
          {day.assignmentSummary && (
            <Typography variant="body1" color="text.primary">
              {day.assignmentSummary}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
