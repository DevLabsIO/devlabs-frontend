"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession } from "next-auth/react";
import type { User } from "@/types/entities";
import type { SessionContextType } from "@/types/auth";

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const user = session?.user as User | undefined;
  const isAuthenticated = status === "authenticated" && !!user;
  const isLoading = status === "loading";

  return (
    <SessionContext.Provider
      value={{
        session,
        status,
        update,
        user,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error(
      "useSessionContext must be used within SessionContextProvider",
    );
  }
  return ctx;
}
