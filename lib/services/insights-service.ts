import type { InsightsPayload } from "@/lib/types/calendar";

const INSIGHTS_ENDPOINT = "/api/insights";

export async function fetchInsights(): Promise<InsightsPayload> {
  const response = await fetch(INSIGHTS_ENDPOINT, { cache: "no-store" });
  if (!response.ok) {
    const message = (await response.json().catch(() => null))?.message;
    throw new Error(message ?? "Failed to load insights");
  }
  return (await response.json()) as InsightsPayload;
}
