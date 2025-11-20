export interface ReviewProjectInfo {
  projectId: string;
  projectTitle: string;
  teamId: string;
  teamName: string;
  teamMembers: {
    id: string;
    name: string;
  }[];
  batchIds: string[];
  courseIds: string[];
}

export interface TeamFilterInfo {
  teamId: string;
  teamName: string;
}

export interface BatchFilterInfo {
  batchId: string;
  batchName: string;
}

export interface CourseFilterInfo {
  courseId: string;
  courseName: string;
  courseCode: string;
}

export interface ReviewProjectsResponse {
  reviewId: string;
  reviewName: string;
  projects: ReviewProjectInfo[];
  teams: TeamFilterInfo[];
  batches: BatchFilterInfo[];
  courses: CourseFilterInfo[];
}
