"use client";

import { useMemo, useRef, useState } from "react";
import { Alert, Button, Card, CardContent, LinearProgress, List, ListItem, Stack, Typography } from "@mui/material";

interface CalendarUploaderProps {
  onUpload: (formData: FormData) => Promise<unknown>;
  isUploading: boolean;
}

const STATUS_STEPS = [
  { label: "Uploading CSV…", delay: 0 },
  { label: "Parsing 90-day template…", delay: 4000 },
  { label: "Upserting calendar days…", delay: 9000 },
  { label: "Seeding tracker metrics…", delay: 14000 },
];

export function CalendarUploader({ onUpload, isUploading }: CalendarUploaderProps) {
  const [statusIndex, setStatusIndex] = useState<number | null>(null);
  const [result, setResult] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeStatus = useMemo(() => (statusIndex !== null ? STATUS_STEPS[statusIndex] : null), [statusIndex]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const startStatusUpdates = () => {
    clearTimers();
    setStatusIndex(0);
    STATUS_STEPS.forEach((step, index) => {
      const handle = setTimeout(() => {
        setStatusIndex(index);
      }, step.delay);
      timers.current.push(handle);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("calendar", file);

    setResult(null);
    startStatusUpdates();
    try {
      await onUpload(formData);
      setResult({ tone: "success", text: "Calendar uploaded successfully" });
    } catch (error) {
      setResult({ tone: "error", text: (error as Error).message });
    } finally {
      clearTimers();
      setStatusIndex(null);
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
            <div>
              <Typography variant="h6">90-day template</Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a CSV to seed assignments and input fields. Future multi-calendar support will reuse this flow.
              </Typography>
            </div>
            <Button variant="outlined" component="label" disabled={isUploading}>
              {isUploading ? "Uploading…" : "Upload CSV"}
              <input type="file" accept=".csv" hidden onChange={handleFileChange} />
            </Button>
          </Stack>
          {isUploading && activeStatus && (
            <Stack spacing={1} data-testid="calendar-upload-status">
              <LinearProgress />
              <Typography variant="body2" color="text.secondary">
                {activeStatus.label}
              </Typography>
            </Stack>
          )}
          {result && (
            <Alert severity={result.tone} onClose={() => setResult(null)}>
              {result.text}
            </Alert>
          )}
          <List dense>
            <ListItem>Required columns: day_number, assignment_title.</ListItem>
            <ListItem>Optional: assignment_summary, tracker_prompt, field_* columns.</ListItem>
            <ListItem>Separate multiple field options with the | character.</ListItem>
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
}
