import { Metadata } from "next";

import { InsightsBoard } from "@/components/insights/InsightsBoard";

export const metadata: Metadata = {
  title: "Insights • Improve 90",
};

export default function InsightsPage() {
  return <InsightsBoard />;
}
