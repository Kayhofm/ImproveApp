"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const TOTAL_SESSIONS = 12;

type SessionNote = {
  date: string;
  therapist: string;
  summary: string;
  details: string;
};

function SessionPager({ session, onChange }: { session: number; onChange: (value: number) => void }) {
  const handleNext = () => {
    if (session < TOTAL_SESSIONS) onChange(session + 1);
  };

  const handlePrev = () => {
    if (session > 1) onChange(session - 1);
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton onClick={handlePrev} disabled={session === 1}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="subtitle1">Session {session}</Typography>
        <IconButton onClick={handleNext} disabled={session === TOTAL_SESSIONS}>
          <ArrowForwardIcon />
        </IconButton>
      </Stack>
      <Pagination
        size="small"
        count={TOTAL_SESSIONS}
        siblingCount={1}
        boundaryCount={1}
        page={session}
        onChange={(_, value) => onChange(value)}
      />
    </Stack>
  );
}

export function TherapyJournal() {
  const [session, setSession] = useState(1);
  const [note, setNote] = useState<SessionNote>({ date: "", therapist: "", summary: "", details: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    const loadNote = async () => {
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const response = await fetch(`/api/therapy?sessionNumber=${session}`);
        if (!response.ok) {
          const message = await response.text();
          if (!aborted) {
            setError(message || "Unable to load session");
            setNote({ date: "", therapist: "", summary: "", details: "" });
          }
          return;
        }
        const data = (await response.json()) as {
          note: { date: string | null; therapist: string | null; summary: string | null; details: string | null } | null;
        };
        if (!aborted) {
          setNote({
            date: data.note?.date ?? "",
            therapist: data.note?.therapist ?? "",
            summary: data.note?.summary ?? "",
            details: data.note?.details ?? "",
          });
        }
      } catch (loadError) {
        if (!aborted) {
          console.warn("Therapy session load failed", loadError);
          setError("Unable to load session");
          setNote({ date: "", therapist: "", summary: "", details: "" });
        }
      } finally {
        if (!aborted) setLoading(false);
      }
    };

    loadNote();
    return () => {
      aborted = true;
    };
  }, [session]);

  const updateNote = (field: keyof SessionNote, value: string) => {
    setNote((prev) => ({ ...prev, [field]: value }));
    setStatus(null);
  };

  const saveNote = async () => {
    setSaving(true);
    setError(null);
    setStatus(null);
    try {
      const response = await fetch("/api/therapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionNumber: session,
          date: note.date || null,
          therapist: note.therapist || null,
          summary: note.summary || "",
          details: note.details || "",
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || "Unable to save session");
        return;
      }

      const data = (await response.json()) as {
        note: { date: string | null; therapist: string | null; summary: string | null; details: string | null } | null;
      };
      setNote({
        date: data.note?.date ?? "",
        therapist: data.note?.therapist ?? "",
        summary: data.note?.summary ?? "",
        details: data.note?.details ?? "",
      });
      setStatus("Saved");
    } catch (saveError) {
      console.error("Therapy session save failed", saveError);
      setError("Unable to save session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <SessionPager session={session} onChange={setSession} />
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Therapy summary</Typography>
              <Typography variant="body2" color="text.secondary">
                Keep quick notes for each session.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Session date"
                type="date"
                value={note.date}
                onChange={(event) => updateNote("date", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                disabled={loading}
              />
              <TextField
                label="Therapist"
                type="text"
                value={note.therapist}
                onChange={(event) => updateNote("therapist", event.target.value)}
                fullWidth
                disabled={loading}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: {
                    sx: {
                      "&::placeholder": { opacity: 1 },
                    },
                  },
                }}
              />
            </Stack>
            <TextField
              label={`Session ${session} summary`}
              value={note.summary}
              onChange={(event) => updateNote("summary", event.target.value)}
              placeholder="What did you cover? How did you feel? Any follow-ups?"
              multiline
              minRows={4}
              fullWidth
              disabled={loading}
            />
            <TextField
              label={`Session ${session} details`}
              value={note.details}
              onChange={(event) => updateNote("details", event.target.value)}
              placeholder="Notes, quotes, techniques, follow-ups"
              multiline
              minRows={4}
              fullWidth
              disabled={loading}
            />
            <Stack direction="row" alignItems="center" spacing={2}>
              <Button variant="contained" onClick={saveNote} disabled={saving || loading}>
                {saving ? "Saving…" : "Save session"}
              </Button>
              {status === "Saved" ? (
                <Typography variant="body2" color="success.main">
                  Saved
                </Typography>
              ) : null}
              {loading ? <CircularProgress size={20} /> : null}
            </Stack>
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
