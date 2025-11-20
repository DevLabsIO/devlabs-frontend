/**
 * Session Context Types
 * Types for session management and context
 */

import { Session } from "next-auth";
import { User } from "../entities/user.types";

export interface SessionContextType {
  session: Session | null;
  status: "authenticated" | "loading" | "unauthenticated";
  update: (data?: unknown) => Promise<Session | null>;
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
}
