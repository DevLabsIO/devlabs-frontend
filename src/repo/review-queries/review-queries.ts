import axiosInstance from "@/lib/axios/axios-client";
import { CreateReviewRequest, UpdateReviewRequest } from "@/types/features";

const reviewQueries = {
    createReview: async (data: CreateReviewRequest) => {
        const response = await axiosInstance.post("/api/review", data);
        return response.data;
    },

    getReviewById: async (reviewId: string) => {
        const response = await axiosInstance.get(`/api/review/${reviewId}`);
        return response.data;
    },

    getUserBasedReviews: async (reviewId: string) => {
        const response = await axiosInstance.get(`/api/review/user/${reviewId}`);
        return response.data;
    },

    updateReview: async (reviewId: string, data: UpdateReviewRequest) => {
        const response = await axiosInstance.put(`/api/review/${reviewId}`, data);
        return response.data;
    },

    deleteReview: async (reviewId: string, userId: string) => {
        const response = await axiosInstance.delete(`/api/review/${reviewId}`, {
            data: { userId },
        });
        return response.data;
    },

    getReviewProjects: async (
        reviewId: string,
        teamId?: string,
        batchId?: string,
        courseId?: string
    ) => {
        const params = new URLSearchParams();
        if (teamId) params.append("teamId", teamId);
        if (batchId) params.append("batchId", batchId);
        if (courseId) params.append("courseId", courseId);

        const queryString = params.toString();
        const url = `/api/review/${reviewId}/projects${queryString ? `?${queryString}` : ""}`;

        const response = await axiosInstance.get(url);
        return response.data;
    },

    getReviewExportData: async (reviewId: string, batchIds?: string[], courseIds?: string[]) => {
        const params = new URLSearchParams();
        batchIds?.forEach((id) => params.append("batchIds", id));
        courseIds?.forEach((id) => params.append("courseIds", id));

        const queryString = params.toString();
        const url = `/api/review/${reviewId}/export${queryString ? `?${queryString}` : ""}`;

        const response = await axiosInstance.get(url);
        return response.data;
    },
};

export default reviewQueries;
