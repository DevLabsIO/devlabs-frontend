/**
 * Course Entity Types
 * Course-related type definitions
 */

import { Project } from "./project.types";
import { ReviewHistory } from "./review.types";

export enum CourseType {
  CORE,
  ELECTIVE,
  MICRO_CREDENTIAL,
}

export interface Course extends Record<string, unknown> {
  id: string;
  name: string;
  code?: string;
  description: string;
  type: CourseType;
  createdAt: string;
  updatedAt: string;
}

export interface CourseData {
  id: string;
  name: string;
  code?: string;
  description: string;
  type: "CORE" | "ELECTIVE" | "MICRO_CREDENTIAL";
  progressPercentage: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  projects: Project[];
  reviewHistory: ReviewHistory[];
  lastReviewDate: string | null;
  totalReviews: number;
}

export interface StudentCourse {
  id: string;
  name: string;
  code: string;
  description: string;
  averageScorePercentage: number;
  reviewCount: number;
}
