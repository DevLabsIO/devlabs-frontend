import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/entities";
import axiosInstance from "@/lib/axios/axios-client";

export interface StudentsDataTableResponse {
    data: User[];
    pagination: {
        total_pages: number;
        current_page: number;
        per_page: number;
        total_count: number;
    };
}

export const useCourseStudents = (
    courseId: string,
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
) => {
    return useQuery<StudentsDataTableResponse, Error>({
        queryKey: ["courseStudents", courseId, searchQuery, page, size, sortBy, sortOrder],
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
                url = `/api/course/${courseId}/students/search`;
            } else {
                url = `/api/course/${courseId}/students`;
            }

            const response = await axiosInstance.get(url, { params });
            return response.data;
        },
        enabled: !!courseId,
    });
};
