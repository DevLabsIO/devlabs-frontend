export interface CreateTeamRequest {
    name: string;
    description?: string;
    memberIds: string[];
    creatorId: string;
}

export interface UpdateTeamRequest {
    name?: string;
    description?: string;
    memberIds?: string[];
}
