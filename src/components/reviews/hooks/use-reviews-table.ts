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
  status?: string,
) => {
  const { user } = useSessionContext();

  const query = useQuery({
    queryKey: [
      "reviews",
      searchQuery,
      page,
      size,
      sortBy,
      sortOrder,
      courseId,
      status,
    ],

    queryFn: async (): Promise<DataTableResponse<Review>> => {
      if (!user) throw new Error("User not authenticated");

      let endpoint: string;
      const params: { [key: string]: string | number } = {};

      // Add pagination parameters
      params.page = page.toString();
      params.size = size.toString();

      // Add sorting parameters (always include these now)
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      // Use different endpoints based on whether we're searching or not
      if (searchQuery && searchQuery.trim().length > 0) {
        // Use search endpoint when there's a search query
        endpoint = `/api/review/search`;
        params.name = searchQuery;

        // Add filter parameters for search
        if (courseId) {
          params.courseId = courseId;
        }

        if (status) {
          params.status = status;
        }
      } else {
        // Use regular endpoint for listing all reviews (user-based via JWT)
        endpoint = `/api/review`;
      }

      const response = await axiosInstance.get(endpoint, { params });
      const backendResponse = response.data;

      // The backend now always returns paginated responses
      if (backendResponse.pagination) {
        return backendResponse as DataTableResponse<Review>;
      }

      // Fallback for any legacy responses (shouldn't happen with new backend)
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

  const queryWithFlag = query as typeof query & { isQueryHook: boolean };
  queryWithFlag.isQueryHook = true;

  return queryWithFlag;
};
