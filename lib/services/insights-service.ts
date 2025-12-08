import type { InsightsPayload } from "@/lib/types/calendar";
import { mockInsightsPayload } from "@/lib/mocks/insights";

const INSIGHTS_ENDPOINT = "/api/insights";

export async function fetchInsights(): Promise<InsightsPayload> {
  try {
    const response = await fetch(INSIGHTS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load insights");
    return (await response.json()) as InsightsPayload;
  } catch (error) {
    console.warn("Falling back to mock insights", error);
    return mockInsightsPayload;
  }
}
