"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { hash, search } = window.location;
    const hasAuthHash = Boolean(hash && hash.includes("access_token"));
    const hasRecoveryHash = Boolean(hash && hash.includes("type=recovery"));
    const hasRecoverySearch = Boolean(search && (search.includes("type=recovery") || search.includes("code=")));

    if (hasAuthHash || hasRecoveryHash || hasRecoverySearch) {
      window.location.replace(`/auth/callback${search}${hash}`);
      return;
    }

    window.location.replace("/calendar");
  }, []);

  return null;
}
