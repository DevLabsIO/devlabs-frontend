import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Team } from "@/types/types";
import axiosInstance from "@/lib/axios/axios-client";

interface DataTableResponse {
  data: Team[];
  pagination: {
    total_pages: number;
    current_page: number;
    per_page: number;
    total_count: number;
  };
}

export const useTeams = (
  searchQuery?: string,
  page: number = 0,
  size: number = 10,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
) => {
  const { data: session } = useSession();
  const user = session?.user;

  const query = useQuery({
    queryKey: [
      "teams",
      user?.id,
      user?.role,
      searchQuery,
      page,
      size,
      sortBy,
      sortOrder,
    ],
    queryFn: async (): Promise<DataTableResponse> => {
      if (!user) throw new Error("User not authenticated");

      let endpoint = "/teams";
      const params: { [key: string]: string | number } = {};

      if (sortBy) {
        params.sort_by = sortBy;
      }

      if (sortOrder) {
        params.sort_order = sortOrder;
      }
      if (searchQuery) {
        endpoint = `/teams/search/${user.id}`;
        params.query = searchQuery;
        params.page = page.toString();
        params.size = size.toString();
      } else {
        params.page = page.toString();
        params.size = size.toString();

        // Role-based team fetching
        if (user.role === "STUDENT") {
          endpoint = `/teams/user/${user.id}`;
        } else if (user.role === "ADMIN" || user.role === "MANAGER") {
          endpoint = `/teams`;
        } else if (user.role === "FACULTY") {
          // Faculty can see teams from courses they teach
          endpoint = `/teams/user/${user.id}`;
        } else {
          // Default fallback for any other roles
          endpoint = `/teams/user/${user.id}`;
        }
      }

      const response = await axiosInstance.get(endpoint, { params });
      const backendResponse = response.data;

      if (backendResponse.pagination) {
        return backendResponse as DataTableResponse;
      }

      const teams = Array.isArray(backendResponse)
        ? backendResponse
        : backendResponse.data || [];

      return {
        data: teams,
        pagination: {
          total_pages: 1,
          current_page: 1,
          per_page: teams.length,
          total_count: teams.length,
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
