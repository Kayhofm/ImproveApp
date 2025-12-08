"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/GridLegacy";

import { fetchInsights } from "@/lib/services/insights-service";
import { InsightGroupCard } from "@/components/insights/InsightGroupCard";
import { TrackerTrendCard } from "@/components/insights/TrackerTrendCard";

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
        <Stack spacing={4}>
          <Grid container spacing={3}>
            {data.groups.map((group) => (
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
          {data.trackers.length ? (
            <Stack spacing={2}>
              <div>
                <Typography variant="h5">Tracker Trends</Typography>
                <Typography variant="body2" color="text.secondary">
                  Most recent behavior metrics plotted across the program.
                </Typography>
              </div>
              <Stack spacing={3}>
                {data.trackers.slice(0, 3).map((series, index) => (
                  <TrackerTrendCard
                    key={series.metricKey}
                    series={series}
                    color={
                      [
                        "#1F67FF",
                        "#F97316",
                        "#22C55E",
                      ][index % 3]
                    }
                  />
                ))}
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
}
