/**
 * Auth Helper Types
 * Types for authentication helper functions
 */

import { User } from "../entities/user.types";

export interface UserExistenceCheckResult {
  exists: boolean;
  isLoading: boolean;
  error?: Error;
}

export interface VerifyUserParams {
  email: string;
  name: string;
  keycloakId: string;
  role: string;
}

export interface VerifyUserResult {
  exists: boolean;
  user?: User | null;
}

export enum UserType {
  SUPERUSER = "superuser",
  ADMIN = "admin",
  MANAGER = "manager",
  FACULTY = "faculty",
  STUDENT = "student",
}
