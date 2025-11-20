import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { Course } from "@/types/entities";
import { DataTableResponse } from "@/types/ui";
import axiosInstance from "@/lib/axios/axios-client";

export const useMyCourses = (
  searchQuery?: string,
  page: number = 0,
  size: number = 10,
  sortBy: string = "name",
  sortOrder: "asc" | "desc" = "asc",
) => {
  const { user } = useSessionContext();

  const query = useQuery({
    queryKey: [
      "my-courses",
      user?.id,
      searchQuery,
      page,
      size,
      sortBy,
      sortOrder,
    ],
    queryFn: async (): Promise<DataTableResponse<Course>> => {
      if (!user) throw new Error("User not authenticated");

      let endpoint = "/api/course/my-courses";
      const params: { [key: string]: string } = {
        page: page.toString(),
        size: size.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const body: { [key: string]: string } = {};

      if (searchQuery) {
        endpoint = `/api/course/my-courses/search`;
        body.query = searchQuery;
      }

      const response = await axiosInstance.post(endpoint, body, { params });
      const backendResponse = response.data;

      if (backendResponse.pagination) {
        return backendResponse as DataTableResponse<Course>;
      }

      const courses = Array.isArray(backendResponse)
        ? backendResponse
        : backendResponse.data || [];

      return {
        data: courses,
        pagination: {
          total_pages: 1,
          current_page: 1,
          per_page: courses.length,
          total_count: courses.length,
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
