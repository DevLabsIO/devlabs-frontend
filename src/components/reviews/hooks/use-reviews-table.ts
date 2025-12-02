import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { Review } from "@/types/entities";
import { DataTableResponse } from "@/types/ui";
import axiosInstance from "@/lib/axios/axios-client";

export const useReviews = (
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = "startDate",
    sortOrder: "asc" | "desc" = "desc",
    courseId?: string,
    status?: string
) => {
    const { user } = useSessionContext();

    const query = useQuery({
        queryKey: ["reviews", searchQuery, page, size, sortBy, sortOrder, courseId, status],

        queryFn: async (): Promise<DataTableResponse<Review>> => {
            if (!user) throw new Error("User not authenticated");

            const params: { [key: string]: string | number } = {};

            params.page = page.toString();
            params.size = size.toString();
            params.sortBy = sortBy;
            params.sortOrder = sortOrder;

            let endpoint: string;

            if ((searchQuery && searchQuery.trim().length > 0) || status) {
                endpoint = `/api/review/search`;

                if (searchQuery && searchQuery.trim().length > 0) {
                    params.name = searchQuery;
                }
                if (courseId) {
                    params.courseId = courseId;
                }
                if (status) {
                    params.status = status;
                }
            } else {
                endpoint = `/api/review`;
                if (courseId) {
                    params.courseId = courseId;
                }
            }

            const response = await axiosInstance.get(endpoint, { params });
            const backendResponse = response.data;

            if (backendResponse.pagination) {
                return backendResponse as DataTableResponse<Review>;
            }

            const reviews = Array.isArray(backendResponse)
                ? backendResponse
                : backendResponse.data || [];

            return {
                data: reviews,
                pagination: {
                    total_pages: 1,
                    current_page: page,
                    per_page: reviews.length,
                    total_count: reviews.length,
                },
            };
        },
        enabled: !!user,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    return Object.assign(query, { isQueryHook: true });
};
