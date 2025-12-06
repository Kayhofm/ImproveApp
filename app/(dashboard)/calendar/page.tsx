import { Metadata } from "next";

import { CalendarExperience } from "@/components/calendar/CalendarExperience";

export const metadata: Metadata = {
  title: "Calendar • Improve 90",
};

export default function CalendarPage() {
  return <CalendarExperience />;
}
