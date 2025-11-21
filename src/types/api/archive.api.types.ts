import { Project } from "../entities";

export interface ArchiveResponse {
    data: Project[];
    pagination: {
        current_page: number;
        per_page: number;
        total_pages: number;
        total_count: number;
    };
}
