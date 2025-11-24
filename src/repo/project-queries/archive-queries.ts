import axiosInstance from "@/lib/axios/axios-client";
import { ArchiveResponse } from "@/types/api";

export type { ArchiveResponse } from "@/types/api";

export const archiveQueries = {
    fetchArchivedProjects: async (
        userId: string,
        page: number = 0,
        size: number = 10,
        sortBy: string = "updatedAt",
        sortOrder: "asc" | "desc" = "desc"
    ): Promise<ArchiveResponse> => {
        const response = await axiosInstance.get(`/projects/user/${userId}/archive`, {
            params: {
                page,
                size,
                sortBy,
                sortOrder,
            },
        });
        return response.data;
    },

    searchArchivedProjects: async (
        userId: string,
        query: string,
        page: number = 0,
        size: number = 10,
        sortBy: string = "updatedAt",
        sortOrder: "asc" | "desc" = "desc"
    ): Promise<ArchiveResponse> => {
        const response = await axiosInstance.get(`/projects/user/${userId}/archive/search`, {
            params: {
                query,
                page,
                size,
                sortBy,
                sortOrder,
            },
        });
        return response.data;
    },
};
