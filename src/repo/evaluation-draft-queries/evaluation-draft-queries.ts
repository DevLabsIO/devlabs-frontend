import axiosInstance from "@/lib/axios/axios-client";
import {
  SaveDraftRequest,
  SaveDraftResponse,
  GetDraftResponse,
} from "@/types/api";

export type {
  CriterionScoreData,
  ParticipantScoreData,
  EvaluationDraft,
  SaveDraftRequest,
  SaveDraftResponse,
  GetDraftResponse,
} from "@/types/api";

const getDraft = async (
  reviewId: string,
  projectId: string,
  courseId: string,
): Promise<GetDraftResponse> => {
  const response = await axiosInstance.get("/api/individualScore/draft", {
    params: {
      reviewId,
      projectId,
      courseId,
    },
  });
  return response.data;
};

const saveDraft = async (
  request: SaveDraftRequest,
): Promise<SaveDraftResponse> => {
  const response = await axiosInstance.post(
    "/api/individualScore/draft",
    request,
  );
  return response.data;
};

const clearDraft = async (
  reviewId: string,
  projectId: string,
  courseId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete("/api/individualScore/draft", {
    params: {
      reviewId,
      projectId,
      courseId,
    },
  });
  return response.data;
};

export const evaluationDraftQueries = {
  getDraft,
  saveDraft,
  clearDraft,
};
