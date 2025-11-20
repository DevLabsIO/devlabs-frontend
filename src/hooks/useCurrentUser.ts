"use client";

import { useSessionContext } from "@/lib/session-context";

/**
 * @deprecated Use `useSessionContext` directly instead.
 * This hook is unoptimized and will be removed in a future version.
 *
 * Migration example:
 * ```
 * // Old:
 * const user = useCurrentUser();
 *
 * // New:
 * const { user } = useSessionContext();
 * ```
 */
export function useCurrentUser() {
  const { user } = useSessionContext();
  return user;
}
