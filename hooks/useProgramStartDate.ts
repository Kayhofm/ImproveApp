"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface StartDatePayload {
  startDate: string | null;
}

const QUERY_KEY = ["program-start-date"] as const;

async function fetchStartDate(): Promise<StartDatePayload> {
  const response = await fetch("/api/profile/start-date", { cache: "no-store" });

  if (response.status === 401) {
    return { startDate: null };
  }

  if (!response.ok) {
    throw new Error("Unable to load start date");
  }

  return response.json();
}

async function saveStartDate(startDate: string | null): Promise<StartDatePayload> {
  const response = await fetch("/api/profile/start-date", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startDate }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: "Unable to save start date" }));
    throw new Error(payload?.message ?? "Unable to save start date");
  }

  return response.json();
}

export function useProgramStartDate() {
  const client = useQueryClient();

  const query = useQuery({ queryKey: QUERY_KEY, queryFn: fetchStartDate });

  const updateStartDate = useMutation({
    mutationFn: (value: string | null) => saveStartDate(value),
    onMutate: async (value) => {
      await client.cancelQueries({ queryKey: QUERY_KEY });
      const previous = client.getQueryData<StartDatePayload>(QUERY_KEY);
      client.setQueryData(QUERY_KEY, { startDate: value });
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        client.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return { ...query, updateStartDate };
}
