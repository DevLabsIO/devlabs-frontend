import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/entities";
import { DataTableResponse } from "@/types/ui";
import axiosInstance from "@/lib/axios/axios-client";

export const useUsers = (
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    columnFilters?: Record<string, string[]>,
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
) => {
    const roles = columnFilters?.role || [];
    const isActiveFilter = columnFilters?.isActive?.[0];
    const query = useQuery({
        queryKey: [
            "users",
            roles,
            isActiveFilter,
            searchQuery,
            page,
            size,
            columnFilters,
            sortBy,
            sortOrder,
        ],
        queryFn: async (): Promise<DataTableResponse<User>> => {
            let endpoint = "/api/user";
            const params: { [key: string]: string | string[] } = {};

            if (roles.length > 0 && !roles.includes("ALL")) {
                params.role = roles;
            }

            if (isActiveFilter && isActiveFilter !== "ALL") {
                params.isActive = isActiveFilter;
            }

            if (searchQuery) {
                endpoint = `/api/user/search`;
                params.query = searchQuery;
            }

            params.page = page.toString();
            params.size = size.toString();

            const sortByMap: Record<string, string> = {
                created_at: "createdAt",
                updated_at: "updatedAt",
                phone_number: "phoneNumber",
                is_active: "isActive",
            };
            params.sort_by = sortByMap[sortBy] || sortBy;
            params.sort_order = sortOrder;

            const response = await axiosInstance.get(endpoint, { params });
            const backendResponse = response.data;

            if (Array.isArray(backendResponse)) {
                return {
                    data: backendResponse,
                    pagination: {
                        total_pages: 1,
                        current_page: 0,
                        per_page: backendResponse.length,
                        total_count: backendResponse.length,
                    },
                };
            }

            if (backendResponse.pagination) {
                return backendResponse as DataTableResponse<User>;
            } else {
                const users = backendResponse.data || [];
                return {
                    data: users,
                    pagination: {
                        total_pages: 1,
                        current_page: 0,
                        per_page: users.length,
                        total_count: users.length,
                    },
                };
            }
        },
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
    return Object.assign(query, { isQueryHook: true });
};
