import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios-client";
import { Semester } from "@/types/entities";
import { DataTableResponse } from "@/types/ui";

const useGetSemesters = (
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    columnFilters?: Record<string, string[]>,
    sortBy: string = "",
    sortOrder: string = ""
) => {
    return useQuery({
        queryKey: ["semesters", searchQuery, page, size, columnFilters, sortBy, sortOrder],
        queryFn: async (): Promise<DataTableResponse<Semester>> => {
            const isActiveFilter = columnFilters?.isActive?.[0];
            let endpoint = "/api/semester";
            const params: { [key: string]: string | number } = {
                page: page.toString(),
                size: size.toString(),
            };

            if (searchQuery) {
                endpoint = `/api/semester/search`;
                params.query = searchQuery;
            }

            if (isActiveFilter !== undefined) {
                params.isActive = isActiveFilter;
            }

            const sortByMap: Record<string, string> = {
                created_at: "createdAt",
                updated_at: "updatedAt",
                is_active: "isActive",
            };
            const finalSortBy = sortBy ? sortByMap[sortBy] || sortBy : "createdAt";
            const finalSortOrder = sortOrder || "desc";
            params.sort_by = finalSortBy;
            params.sort_order = finalSortOrder;

            const response = await axiosInstance.get(endpoint, { params });
            const data = response.data;

            if (Array.isArray(data)) {
                return {
                    data: data,
                    pagination: {
                        total_pages: 1,
                        current_page: 0,
                        per_page: data.length,
                        total_count: data.length,
                    },
                };
            }

            if (data.pagination) {
                return data as DataTableResponse<Semester>;
            }

            if (data.data) {
                return {
                    data: data.data,
                    pagination: {
                        total_pages: 1,
                        current_page: 0,
                        per_page: data.data.length,
                        total_count: data.data.length,
                    },
                };
            }

            return {
                data: [],
                pagination: {
                    total_pages: 0,
                    current_page: 0,
                    per_page: size,
                    total_count: 0,
                },
            };
        },
    });
};

export function useSemestersForDataTable(
    page: number,
    pageSize: number,
    search: string,
    dateRange: { from_date: string; to_date: string },
    sortBy: string,
    sortOrder: string,
    columnFilters?: Record<string, string[]>
) {
    return useGetSemesters(search, page - 1, pageSize, columnFilters, sortBy, sortOrder);
}

useSemestersForDataTable.isQueryHook = true;
