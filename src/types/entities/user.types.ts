/**
 * User Entity Types
 * Core user-related type definitions
 */

export interface User extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  profileId: string;
  role: "STUDENT" | "ADMIN" | "FACULTY" | "MANAGER";
  phoneNumber: string;
  image?: string;
  isActive: boolean;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "FACULTY" | "MANAGER";
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "STUDENT";
  profileImage?: string;
}
