"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";

import type { CalendarFieldTemplate, DayEntryValue } from "@/lib/types/calendar";
import { FieldRenderer } from "./FieldRenderer";

interface DayFormProps {
  dayId: string;
  fields: CalendarFieldTemplate[];
  entries: DayEntryValue[];
  trackerPrompt?: string | null;
  onSaveField: (payload: { dayId: string; fieldId: string; value: unknown }) => Promise<unknown>;
}

export function DayForm({ dayId, fields, entries, trackerPrompt, onSaveField }: DayFormProps) {
  const initialValues = useMemo(() => {
    const map = new Map<string, unknown>();
    entries.forEach((entry) => map.set(entry.fieldId, entry.value));
    return map;
  }, [entries]);

  const [values, setValues] = useState<Map<string, unknown>>(initialValues);
  const [dirtyFields, setDirtyFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setDirtyFields(new Set());
  }, [initialValues]);

  const handleUpdate = (fieldId: string, value: unknown) => {
    setValues((prev) => new Map(prev).set(fieldId, value));
    setDirtyFields((prev) => new Set(prev).add(fieldId));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirtyFields.size) return;
    setIsSubmitting(true);
    try {
      const tasks = Array.from(dirtyFields).map((fieldId) =>
        onSaveField({ dayId, fieldId, value: values.get(fieldId) ?? null })
      );
      await Promise.all(tasks);
      setDirtyFields(new Set());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <div>
              <Typography variant="h6">Reflections</Typography>
              <Typography variant="body2" color="text.secondary">
                {trackerPrompt ?? "Capture today’s reflections. Changes are saved when you press Save."}
              </Typography>
            </div>
            <Button type="submit" variant="contained" loading={isSubmitting}>
              Save
            </Button>
          </Stack>
          <Stack spacing={2}>
            {fields.map((field) => (
              <FieldRenderer
                key={field.id}
                template={field}
                value={values.get(field.id)}
                onChange={(value) => handleUpdate(field.id, value)}
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
