import axiosInstance from "@/lib/axios/axios-client";
import { EvaluationCriteria, ProjectReviewsResponse } from "@/types/features";

const fetchReviewsForProject = async (
  projectId: string,
): Promise<ProjectReviewsResponse> => {
  const response = await axiosInstance.get(`/projects/${projectId}/reviews`);
  return response.data;
};

const fetchEvaluationCriteria = async (
  reviewId: string,
): Promise<EvaluationCriteria> => {
  const response = await axiosInstance.get(
    `/api/review/review/${reviewId}/criteria`,
  );
  return response.data;
};

export const evaluationQueries = {
  fetchReviewsForProject,
  fetchEvaluationCriteria,
};
