export interface ProjectReferenceRequest {
    id?: string;
    title: string;
    url?: string;
    description?: string;
}

export interface CreateProjectRequest {
    title: string;
    description: string;
    objectives?: string;
    githubUrl?: string;
    courseIds?: string[];
    teamId: string;
    references?: ProjectReferenceRequest[];
    uploadedFiles?: string[];
}
