import { useQuery } from "@tanstack/react-query";
import { Batch } from "@/types/entities";
import axiosInstance from "@/lib/axios/axios-client";

export interface BatchesDataTableResponse {
    data: Batch[];
    pagination: {
        total_pages: number;
        current_page: number;
        per_page: number;
        total_count: number;
    };
}

export const useCourseBatches = (
    courseId: string,
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
) => {
    return useQuery<BatchesDataTableResponse, Error>({
        queryKey: ["courseBatches", courseId, searchQuery, page, size, sortBy, sortOrder],
        queryFn: async () => {
            const params: { [key: string]: string | number } = {
                page: page,
                size: size,
                sort_by: sortBy,
                sort_order: sortOrder,
            };

            let url: string;
            if (searchQuery && searchQuery.length > 0) {
                params.query = searchQuery;
                url = `/api/course/${courseId}/batches/search`;
            } else {
                url = `/api/course/${courseId}/batches`;
            }

            const response = await axiosInstance.get(url, { params });
            return response.data;
        },
        enabled: !!courseId,
    });
};
