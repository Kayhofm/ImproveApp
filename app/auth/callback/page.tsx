"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

const MIN_PASSWORD_LENGTH = 8;

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success">("verifying");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const code = searchParams.get("code");
  const type = searchParams.get("type");

  useEffect(() => {
    let cancelled = false;

    async function handleExchange() {
      if (!code) {
        setError("Reset link is missing a verification code. Please request a new email.");
        setStatus("ready");
        return;
      }

      try {
        setStatus("verifying");
        setError(null);
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }

        if (type !== "recovery") {
          router.replace("/dashboard");
          return;
        }

        if (!cancelled) {
          setStatus("ready");
        }
      } catch (exchangeError) {
        if (!cancelled) {
          const message = exchangeError instanceof Error ? exchangeError.message : "Unable to verify reset link.";
          setError(message);
          setStatus("ready");
        }
      }
    }

    handleExchange();

    return () => {
      cancelled = true;
    };
  }, [code, router, supabase, type]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status !== "ready") {
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("submitting");
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setStatus("ready");
      return;
    }

    setStatus("success");
    setTimeout(() => router.replace("/dashboard"), 1200);
  }

  const showForm = type === "recovery";

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">Finish resetting your password</Typography>
          <Typography variant="body2" color="text.secondary">
            Enter a new password to secure your Improve App account.
          </Typography>
        </Stack>

        {status === "verifying" && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Verifying your link…
            </Typography>
          </Stack>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {status === "success" && <Alert severity="success">Password updated. Redirecting…</Alert>}

        {showForm && status !== "success" && (
          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="New password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={status !== "ready"}
            />
            <TextField
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={status !== "ready"}
            />
            <Button type="submit" variant="contained" disabled={status !== "ready"}>
              {status === "submitting" ? "Updating…" : "Save new password"}
            </Button>
          </Stack>
        )}

        {!showForm && status !== "success" && status !== "verifying" && (
          <Alert severity="info">
            Link verified. Redirecting you back to the app…
          </Alert>
        )}
      </Stack>
    </Container>
  );
}
