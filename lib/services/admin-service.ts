import type { ProfileSummary } from "@/lib/types/user";

const ADMIN_ENDPOINT = "/api/admin";

export async function fetchProfiles() {
  const response = await fetch(`${ADMIN_ENDPOINT}/users`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load users");
  return (await response.json()) as ProfileSummary[];
}

export async function inviteUser(payload: {
  email: string;
  role: string;
  fullName?: string;
}) {
  const response = await fetch(`${ADMIN_ENDPOINT}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to invite user");
  }

  return response.json();
}

export async function uploadCalendarCsv(payload: FormData) {
  const response = await fetch(`${ADMIN_ENDPOINT}/calendar`, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Unable to upload calendar");
  }

  return response.json();
}
