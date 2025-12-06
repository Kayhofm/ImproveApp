import type { InsightGroup } from "@/lib/types/calendar";
import { mockInsightGroups } from "@/lib/mocks/insights";

const INSIGHTS_ENDPOINT = "/api/insights";

export async function fetchInsights(): Promise<InsightGroup[]> {
  try {
    const response = await fetch(INSIGHTS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load insights");
    return (await response.json()) as InsightGroup[];
  } catch (error) {
    console.warn("Falling back to mock insights", error);
    return mockInsightGroups;
  }
}
