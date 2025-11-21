import axiosInstance from "@/lib/axios/axios-client";
import { CreateRubricRequest, UpdateRubricRequest, Rubric } from "@/types/features";

const rubricQueries = {
    getUserRubrics: async (userId: string): Promise<Rubric[]> => {
        const response = await axiosInstance.get(`/api/rubrics/user/${userId}`);
        return response.data;
    },

    getRubricById: async (id: string): Promise<Rubric> => {
        const response = await axiosInstance.get(`/api/rubrics/${id}`);
        return response.data;
    },

    createRubric: async (data: CreateRubricRequest): Promise<Rubric> => {
        const response = await axiosInstance.post("/api/rubrics", data);
        return response.data;
    },

    updateRubric: async (id: string, data: UpdateRubricRequest): Promise<Rubric> => {
        const response = await axiosInstance.put(`/api/rubrics/${id}`, data);
        return response.data;
    },

    deleteRubric: async (
        id: string,
        userId: string
    ): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.delete(`/api/rubrics/${id}`, {
            params: { userId },
        });
        return response.data;
    },

    getAllRubrics: async (): Promise<Rubric[]> => {
        const response = await axiosInstance.get("/api/rubrics/all");
        return response.data;
    },
};

export default rubricQueries;
