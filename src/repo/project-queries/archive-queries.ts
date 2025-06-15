import axiosInstance from "@/lib/axios/axios-client";
import { Project } from "@/types/types";

export interface ArchiveResponse {
  data: Project[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

export const archiveQueries = {
  fetchArchivedProjects: async (
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ArchiveResponse> => {
    const response = await axiosInstance.get(
      `/projects/user/${userId}/archive`,
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  searchArchivedProjects: async (
    userId: string,
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<ArchiveResponse> => {
    const response = await axiosInstance.get(
      `/projects/user/${userId}/archive/search`,
      {
        params: { query, page, size },
      }
    );
    return response.data;
  },
};
