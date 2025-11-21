import { Batch } from "../entities";

export interface CreateDepartmentRequest {
    name: string;
}

export interface UpdateDepartmentRequest extends CreateDepartmentRequest {
    id: string;
}

export interface DepartmentResponse {
    id: string;
    name: string;
    batches?: Batch[];
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total_pages: number;
        current_page: number;
        per_page: number;
        total_count: number;
    };
}
