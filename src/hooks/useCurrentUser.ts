"use client";

import { useSessionContext } from "@/lib/session-context";

export function useCurrentUser() {
  const { user } = useSessionContext();
  return user;
}
