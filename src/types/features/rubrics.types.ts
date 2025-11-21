import { Criterion } from "../entities/review.types";

export interface UserInfo {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface Rubric {
    id: string;
    name: string;
    createdBy: UserInfo;
    createdAt: string;
    isShared: boolean;
    criteria: Criterion[];
}

export interface RubricCriterionData {
    name: string;
    description: string;
    maxScore: number;
    isCommon: boolean;
}

export interface CreateRubricRequest {
    name: string;
    userId: string;
    isShared: boolean;
    criteria: RubricCriterionData[];
}

export interface UpdateRubricRequest {
    name: string;
    userId: string;
    isShared: boolean;
    criteria: RubricCriterionData[];
}
