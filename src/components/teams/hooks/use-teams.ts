import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { Team } from "@/types/entities";
import { DataTableResponse } from "@/types/ui";
import axiosInstance from "@/lib/axios/axios-client";

export const useTeams = (
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
) => {
    const { user } = useSessionContext();
    const query = useQuery({
        queryKey: ["teams", user?.id, user?.groups, searchQuery, page, size, sortBy, sortOrder],
        queryFn: async (): Promise<DataTableResponse<Team>> => {
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
                const userGroups = user.groups || [];
                if ((userGroups as string[]).includes("student")) {
                    endpoint = `/teams/user/${user.id}`;
                } else if (
                    (userGroups as string[]).includes("admin") ||
                    (userGroups as string[]).includes("manager")
                ) {
                    endpoint = `/teams`;
                } else if ((userGroups as string[]).includes("faculty")) {
                    endpoint = `/teams/user/${user.id}`;
                } else {
                    endpoint = `/teams/user/${user.id}`;
                }
            }

            const response = await axiosInstance.get(endpoint, { params });
            const backendResponse = response.data;

            if (backendResponse.pagination) {
                return backendResponse as DataTableResponse<Team>;
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
    return Object.assign(query, { isQueryHook: true });
};
