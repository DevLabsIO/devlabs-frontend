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
    startDate: string;
    endDate: string;
    rubricsId: string;
    userId: string;

    courseIds?: string[] | null;
    semesterIds?: string[] | null;
    batchIds?: string[] | null;
    projectIds?: string[] | null;

    sections?: string[] | null;
}

export interface UpdateReviewRequest {
    name: string;
    startDate: string;
    endDate: string;
    rubricsId: string;
    userId: string;

    courseIds?: string[] | null;
    semesterIds?: string[] | null;
    batchIds?: string[] | null;
    projectIds?: string[] | null;

    sections?: string[] | null;
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
