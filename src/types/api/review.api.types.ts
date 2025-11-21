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

export interface ReviewExportResponse {
    reviewId: string;
    reviewName: string;
    students: StudentExportData[];
    criteria: CriteriaInfo[];
}

export interface StudentExportData {
    profileId: string;
    studentName: string;
    email: string;
    teamId: string;
    teamName: string;
    projectId: string;
    projectTitle: string;
    batchIds: string[];
    batchNames: string[];
    courseIds: string[];
    courseNames: string[];
    totalScore: number | null;
    maxScore: number | null;
    percentage: number | null;
    criteriaScores: Record<string, CriteriaScoreData>;
}

export interface CriteriaScoreData {
    criterionId: string;
    criterionName: string;
    score: number | null;
    maxScore: number;
    comment: string | null;
}

export interface CriteriaInfo {
    id: string;
    name: string;
    description: string;
    maxScore: number;
    isCommon: boolean;
}

export interface ReviewProjectsResponse {
    reviewId: string;
    reviewName: string;
    projects: ReviewProjectInfo[];
    teams: TeamFilterInfo[];
    batches: BatchFilterInfo[];
    courses: CourseFilterInfo[];
}
