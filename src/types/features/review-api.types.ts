import { Review } from "../entities/review.types";

export interface ProjectReviewsResponse {
  hasReview: boolean;
  assignmentType: string;
  liveReviews: Review[];
  upcomingReviews: Review[];
  completedReviews: Review[];
}

export interface CreateReviewRequest {
  name: string;
  startDate: string; // YYYY-MM-DD format (LocalDate)
  endDate: string; // YYYY-MM-DD format (LocalDate)
  rubricsId: string; // UUID
  userId: string; // UUID

  courseIds?: string[] | null; // Optional array of UUIDs
  semesterIds?: string[] | null; // Optional array of UUIDs
  batchIds?: string[] | null; // Optional array of UUIDs
  projectIds?: string[] | null; // Optional array of UUIDs

  sections?: string[] | null; // Optional array of strings
}

export interface UpdateReviewRequest {
  name: string;
  startDate: string; // YYYY-MM-DD format (LocalDate)
  endDate: string; // YYYY-MM-DD format (LocalDate)
  rubricsId: string; // UUID
  userId: string; // UUID

  courseIds?: string[] | null; // Optional array of UUIDs
  semesterIds?: string[] | null; // Optional array of UUIDs
  batchIds?: string[] | null; // Optional array of UUIDs
  projectIds?: string[] | null; // Optional array of UUIDs

  sections?: string[] | null; // Optional array of strings
}

interface DepartmentResponse {
  id: string;
  name: string;
}

interface CourseResponse {
  id: string;
  name: string;
  code: string;
}

export interface SemesterResponse {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
}

export interface BatchResponse {
  id: string;
  name: string;
  graduationYear: number;
  section: string;
  department: DepartmentResponse;
  isActive: boolean;
}

export interface ProjectResponse {
  id: string;
  title: string;
  description: string;
  courses: CourseResponse[];
  status: "ONGOING" | "PROPOSED";
}
