import axiosInstance from "@/lib/axios/axios-client";
import { ProjectResult } from "@/types/features";

export const resultQueries = {
  getResults: async (
    reviewId: string,
    projectId: string,
    userId: string,
  ): Promise<ProjectResult> => {
    const response = await axiosInstance.post(
      `/api/review/${reviewId}/results`,
      {
        projectId,
        userId,
      },
    );
    return response.data;
  },
};
