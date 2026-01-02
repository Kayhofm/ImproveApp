import type { Metadata } from "next";

import { TherapyJournal } from "@/components/therapy/TherapyJournal";

export const metadata: Metadata = {
  title: "Therapy • Improve 90",
};

export default function TherapyPage() {
  return <TherapyJournal />;
}
