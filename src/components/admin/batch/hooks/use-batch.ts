import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Batch, User } from "@/types/entities";
import { useSessionContext } from "@/lib/session-context";
import batchQueries from "@/repo/batch-queries/batch-queries";
import axiosInstance from "@/lib/axios/axios-client";

interface BatchDataTableResponse {
    data: Batch[];
    pagination: {
        total_pages: number;
        current_page: number;
        per_page: number;
        total_count: number;
    };
}

interface StudentDataTableResponse {
    data: User[];
    pagination: {
        total_pages: number;
        current_page: number;
        per_page: number;
        total_count: number;
    };
}

export const useAssignStudentsToBatch = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { batchId: string; userIds: (string | number)[] }) => {
            return batchQueries.assignUsersToBatch({
                batchId: data.batchId,
                userIds: data.userIds,
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["batchStudents", variables.batchId],
            });
            queryClient.invalidateQueries({
                queryKey: ["availableStudents", variables.batchId],
            });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export const useBatches = (
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    columnFilters?: Record<string, string[]>,
    sortBy: string = "createdAt",
    sortOrder: string = "desc"
) => {
    const { user } = useSessionContext();
    const isActiveFilter = columnFilters?.isActive?.[0];

    const query = useQuery({
        queryKey: ["batches", user?.id, searchQuery, page, size, isActiveFilter, sortBy, sortOrder],
        queryFn: async (): Promise<BatchDataTableResponse> => {
            if (!user) throw new Error("User not authenticated");

            const params: { [key: string]: string | number } = {
                page: page,
                size: size,
            };

            if (searchQuery) {
                params.query = searchQuery;
            }

            if (isActiveFilter !== undefined) {
                params.isActive = isActiveFilter;
            }

            const sortByMap: Record<string, string> = {
                name: "name",
                join_year: "joinYear",
                section: "section",
                is_active: "isActive",
                department_id: "departmentId",
                created_at: "createdAt",
                updated_at: "updatedAt",
            };
            params.sort_by = sortByMap[sortBy] || sortBy;
            params.sort_order = sortOrder;

            const endpoint = searchQuery ? "/api/batch/search" : "/api/batch";
            const response = await axiosInstance.get(endpoint, { params });

            const backendResponse = response.data;
            if (backendResponse.data && backendResponse.pagination) {
                return backendResponse as BatchDataTableResponse;
            }

            const batches = Array.isArray(backendResponse)
                ? backendResponse
                : backendResponse.data || [];

            return {
                data: batches,
                pagination: {
                    total_pages: 1,
                    current_page: 0,
                    per_page: batches.length,
                    total_count: batches.length,
                },
            };
        },
        enabled: !!user,
    });

    return { ...query, isQueryHook: true };
};

export const useBatchById = (batchId: string) => {
    return useQuery({
        queryKey: ["batch", batchId],
        queryFn: async (): Promise<Batch> => {
            return batchQueries.getBatchById(batchId);
        },
        enabled: !!batchId,
    });
};

export const useBatchStudents = (
    batchId: string,
    searchQuery?: string,
    page: number = 0,
    size: number = 10,
    sortBy?: string,
    sortOrder?: string
) => {
    const query = useQuery({
        queryKey: ["batchStudents", batchId, searchQuery, page, size, sortBy, sortOrder],
        queryFn: async (): Promise<StudentDataTableResponse> => {
            const response = await batchQueries.getBatchStudents(
                batchId,
                page,
                size,
                searchQuery,
                sortBy,
                sortOrder
            );
            return response;
        },
        enabled: !!batchId,
    });

    return { ...query, isQueryHook: true };
};
