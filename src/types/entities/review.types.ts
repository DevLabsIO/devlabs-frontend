export interface Criterion {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  isCommon: boolean;
}

export interface ReviewHistory {
  reviewId: string;
  reviewName: string;
  reviewDate: string;
  averageScore: number;
  maxPossibleScore: number;
  criteriaBreakdown: {
    criterionName: string;
    averageScore: number;
    maxScore: number;
  }[];
}

export interface Review {
  id: string;
  name: string;
  status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  courses: {
    id: string;
    name: string;
    code: string;
    semesterInfo: {
      id: string;
      name: string;
      year: number;
      isActive: boolean;
    };
  }[];
  projects: { id: string; title: string }[];
  sections: { id: string; name: string }[];
  rubricsInfo: {
    id: string;
    name: string;
    criteria: Criterion[];
  };
}

export interface UpcomingReview {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  courseName: string;
}

export interface RecentlyPublishedReview {
  reviewId: string;
  reviewName: string;
  publishedAt: string;
}
