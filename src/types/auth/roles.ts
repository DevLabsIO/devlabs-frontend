/**
 * Keycloak groups and role constants
 */

export const KEYCLOAK_GROUPS = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  FACULTY: "/faculty",
  STUDENT: "/student",
} as const;

export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  FACULTY: "FACULTY",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
