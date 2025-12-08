"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
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

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [status, setStatus] = useState<"verifying" | "ready" | "submitting" | "success">("verifying");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  const code = searchParams.get("code");
  const type = searchParams.get("type");

  useEffect(() => {
    let cancelled = false;

    async function handleExchange() {
      try {
        setStatus("verifying");
        setError(null);
        let resolvedType = type;

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
          const hashParams = hash ? new URLSearchParams(hash) : null;
          const accessToken = hashParams?.get("access_token");
          const refreshToken = hashParams?.get("refresh_token");
          resolvedType = hashParams?.get("type") ?? resolvedType;

          if (!accessToken || !refreshToken) {
            throw new Error("Reset link is missing authentication details. Please request a new email.");
          }

          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
        }

        const normalizedType = (resolvedType ?? "recovery").toLowerCase();
        setIsRecoveryFlow(normalizedType === "recovery");

        if (normalizedType !== "recovery") {
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

  const showForm = isRecoveryFlow;

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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="sm" sx={{ py: 8 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading reset flow…
            </Typography>
          </Stack>
        </Container>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
