export interface CreateProjectRequest {
    title: string;
    description: string;
    objectives?: string;
    courseIds?: string[];
    teamId: string;
}
