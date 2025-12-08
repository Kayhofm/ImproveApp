"use client";

import { useMemo } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

import type { TrackerSeries } from "@/lib/types/calendar";

interface TrackerTrendCardProps {
  series: TrackerSeries;
  color?: string;
}

function safeFormatDate(value: string) {
  try {
    return format(parseISO(value), "MMM d");
  } catch {
    return value;
  }
}

export function TrackerTrendCard({ series, color }: TrackerTrendCardProps) {
  const theme = useTheme();
  const stroke = color ?? theme.palette.primary.main;

  const chartData = useMemo(
    () =>
      series.points.map((point) => ({
        ...point,
        label: `Day ${point.dayNumber}`,
        shortDate: safeFormatDate(point.date),
      })),
    [series.points]
  );

  const firstPoint = chartData[0];
  const lastPoint = chartData.at(-1);
  const rangeLabel = chartData.length
    ? `Day ${firstPoint?.dayNumber ?? "?"} · ${firstPoint?.shortDate ?? ""} – Day ${lastPoint?.dayNumber ?? "?"} · ${lastPoint?.shortDate ?? ""}`
    : "No data";

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ minHeight: 260 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="h6">{series.metricLabel}</Typography>
            <Typography variant="caption" color="text.secondary">
              {rangeLabel}
            </Typography>
          </Stack>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="dayNumber" tickFormatter={(value) => `Day ${value}`} fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip
                formatter={(value: number) => value.toString()}
                labelFormatter={(_, payload) =>
                  payload && payload[0]
                    ? `${payload[0].payload.label} · ${payload[0].payload.shortDate}`
                    : ""
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={stroke}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Stack>
      </CardContent>
    </Card>
  );
}
