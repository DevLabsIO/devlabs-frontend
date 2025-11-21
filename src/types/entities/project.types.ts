import { User } from "./user.types";

export enum ProjectStatus {
  PROPOSED = "PROPOSED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export interface Project extends Record<string, unknown> {
  id: string;
  title: string;
  description: string;
  objectives: string | null;
  status: ProjectStatus;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  githubUrl?: string | null;
  courses: { id: string; name: string; code?: string }[];
  teamMembers: User[];
}

export interface ProjectWithTeam extends Project {
  teamMembers: User[];
  courses: { id: string; name: string; code?: string }[];
}
