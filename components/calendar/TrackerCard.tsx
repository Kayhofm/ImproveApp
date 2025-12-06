"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Stack, Typography, ToggleButtonGroup, ToggleButton, Slider } from "@mui/material";

import type { BehaviorLogValue, BehaviorTemplate } from "@/lib/types/calendar";

interface TrackerCardProps {
  dayId: string;
  metrics: BehaviorTemplate[];
  logs: BehaviorLogValue[];
  onSaveMetric: (payload: { dayId: string; metricId: string; value: unknown }) => Promise<unknown>;
}

export function TrackerCard({ dayId, metrics, logs, onSaveMetric }: TrackerCardProps) {
  const initialValues = useMemo(() => {
    const map = new Map<string, BehaviorLogValue>();
    logs.forEach((log) => map.set(log.metricId, log));
    return map;
  }, [logs]);

  const [values, setValues] = useState(initialValues);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateLocalValue = (metricId: string, patch: Partial<BehaviorLogValue>) => {
    setValues((prev) => {
      const next = new Map(prev);
      const existing =
        next.get(metricId) ??
        ({
          metricId,
          updatedAt: new Date().toISOString(),
        } as BehaviorLogValue);
      next.set(metricId, { ...existing, ...patch, metricId });
      return next;
    });
  };

  const handleBooleanChange = async (metricId: string, next: string | null) => {
    setPending(metricId);
    try {
      await onSaveMetric({ dayId, metricId, value: next === "yes" });
    } finally {
      setPending(null);
    }
  };

  const handleNumberChange = async (metricId: string, value: number) => {
    setPending(metricId);
    try {
      await onSaveMetric({ dayId, metricId, value });
    } finally {
      setPending(null);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6">Trackers</Typography>
          {metrics.map((metric) => {
            const current = values.get(metric.id);
            if (metric.metricType === "boolean") {
              return (
                <Stack key={metric.id} spacing={1}>
                  <Typography variant="subtitle2">{metric.metricLabel}</Typography>
                  <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={current?.valueBoolean ? "yes" : current?.valueBoolean === false ? "no" : null}
                    onChange={(_, value) => {
                      if (!value) return;
                      updateLocalValue(metric.id, { valueBoolean: value === "yes" });
                      handleBooleanChange(metric.id, value);
                    }}
                    disabled={pending === metric.id}
                    size="small"
                  >
                    <ToggleButton value="yes">Yes</ToggleButton>
                    <ToggleButton value="no">No</ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              );
            }

            return (
              <Stack key={metric.id} spacing={1}>
                <Typography variant="subtitle2">{metric.metricLabel}</Typography>
                <Slider
                  min={metric.minValue ?? 0}
                  max={metric.maxValue ?? 10}
                  step={1}
                  value={current?.valueNumber ?? metric.minValue ?? 0}
                  valueLabelDisplay="auto"
                  onChange={(_, value) => updateLocalValue(metric.id, { valueNumber: value as number })}
                  onChangeCommitted={(_, value) => handleNumberChange(metric.id, value as number)}
                  disabled={pending === metric.id}
                />
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
