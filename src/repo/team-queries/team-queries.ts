import axiosInstance from "@/lib/axios/axios-client";
import { CreateTeamRequest, UpdateTeamRequest } from "@/components/teams/types/types";

const teamQueries = {
    createTeam: async (team: CreateTeamRequest) => {
        const response = await axiosInstance.post("/teams", team);
        return response.data;
    },
    updateTeam: async (teamId: string, team: UpdateTeamRequest) => {
        const response = await axiosInstance.put(`/teams/${teamId}`, team);
        return response.data;
    },
    deleteTeam: async (teamId: string) => {
        const response = await axiosInstance.delete(`/teams/${teamId}`);
        return response.data;
    },
    getTeamById: async (teamId: string) => {
        const response = await axiosInstance.get(`/teams/${teamId}`);
        return response.data;
    },
    searchTeamsByUser: async (
        userId: string,
        query: string,
        page: number = 0,
        size: number = 10
    ) => {
        const response = await axiosInstance.get(`/teams/search/${userId}`, {
            params: { query, page, size },
        });
        return response.data;
    },

    getAllTeams: async (
        page: number = 0,
        size: number = 10,
        sortBy?: string,
        sortOrder?: "asc" | "desc"
    ) => {
        const params: { [key: string]: string | number } = {
            page: page.toString(),
            size: size.toString(),
        };

        if (sortBy) {
            params.sort_by = sortBy;
        }

        if (sortOrder) {
            params.sort_order = sortOrder;
        }

        const response = await axiosInstance.get("/teams", { params });
        return response.data;
    },
};

export default teamQueries;
