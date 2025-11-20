"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/types/entities";
import { SessionContextType } from "@/types/auth";

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  // Memoize derived values to prevent unnecessary recalculations
  const user = useMemo(
    () => session?.user as User | undefined,
    [session?.user],
  );
  const isAuthenticated = useMemo(
    () => status === "authenticated" && !!session?.user,
    [status, session?.user],
  );
  const isLoading = status === "loading";

  const value: SessionContextType = useMemo(
    () => ({
      session,
      status,
      update,
      user,
      isAuthenticated,
      isLoading,
    }),
    [session, status, update, user, isAuthenticated, isLoading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(
      "useSessionContext must be used within SessionContextProvider",
    );
  }
  return context;
}
