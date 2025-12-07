"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";

import { fetchInsights } from "@/lib/services/insights-service";
import { InsightGroupCard } from "@/components/insights/InsightGroupCard";

export function InsightsBoard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });

  if (error) {
    return <Alert severity="error">Failed to load insights</Alert>;
  }

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4" gutterBottom>
          Insights
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Organized snapshots of everything collected via the calendar inputs.
        </Typography>
      </div>
      {isLoading || !data ? (
        <Alert severity="info">Crunching the most recent entries…</Alert>
      ) : (
        <Grid container spacing={3}>
          {data.map((group) => (
            <Grid
              key={group.fieldType}
              item
              xs={12}
              md={group.fieldType === "long_text" ? 12 : 6}
            >
              <InsightGroupCard group={group} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
