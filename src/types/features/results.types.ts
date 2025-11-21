export interface ProjectResult {
    id: string;
    reviewName: string;
    projectId: string;
    projectTitle: string;
    isPublished: boolean;
    userRole: "STUDENT" | "FACULTY" | "MANAGER" | "ADMIN";
    canViewAllResults: boolean;
    results: {
        studentId: string;
        studentName: string;
        scores: {
            criterionId: string;
            criterionName: string;
            score: number;
            maxScore: number;
            comment?: string;
        }[];
        totalScore: number;
        maxPossibleScore: number;
        percentage: number;
    }[];
}
