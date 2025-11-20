import axiosInstance from "@/lib/axios/axios-client";
import { User } from "@/components/admin/users/types/types";
import { SyncStatsResponse, SyncRequest, SyncResponse } from "@/types/sync";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateUserData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  password: string;
  isActive: boolean;
}

interface UpdateUserData extends Omit<CreateUserData, "password"> {
  id: string;
}

interface CreateKeycloakUserData {
  email: string;
  name: string;
  role: string;
  phoneNumber: string;
}

const userQueries = {
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await axiosInstance.post("/api/user", data);
    return response.data;
  },

  updateUser: async (data: UpdateUserData): Promise<User> => {
    const { id, ...updateData } = data;
    const response = await axiosInstance.put(`/api/user/${id}`, updateData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/api/user/${userId}`);
  },

  bulkDeleteUsers: async (userIds: (string | number)[]): Promise<void> => {
    await axiosInstance.delete("/api/user/bulk", { data: userIds });
  },

  searchStudents: async (query: string): Promise<User[]> => {
    if (!query) {
      return [];
    }
    const response = await axiosInstance.get(
      `/teams/students/search?query=${encodeURIComponent(query)}`,
    );
    const result = response.data;
    return Array.isArray(result) ? result : result.data || [];
  },

  fetchUserById: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get(`/api/user/${userId}`);
    return response.data;
  },

  checkUserExists: async (email: string): Promise<{ exists: boolean }> => {
    try {
      const response = await axiosInstance.get(
        `/api/user/check-exists?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch {
      return { exists: false };
    }
  },

  createKeycloakUser: async (data: CreateKeycloakUserData): Promise<User> => {
    const response = await axiosInstance.post("/api/user/keycloak-sync", {
      name: data.name,
      email: data.email,
      role: data.role,
      phoneNumber: data.phoneNumber,
      isActive: true,
    });
    return response.data;
  },

  getSyncStats: async (): Promise<SyncStatsResponse> => {
    const response = await axiosInstance.get("/api/user/sync-stats");
    return response.data;
  },

  syncFromKeycloak: async (data: SyncRequest): Promise<SyncResponse> => {
    const response = await axiosInstance.post(
      "/api/user/sync-from-keycloak",
      data,
    );
    return response.data;
  },
};

export const useSyncStats = () => {
  return useQuery({
    queryKey: ["sync-stats"],
    queryFn: userQueries.getSyncStats,
    staleTime: 0,
    refetchOnMount: true,
  });
};

export const useSyncFromKeycloak = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userQueries.syncFromKeycloak,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["sync-stats"] });
    },
  });
};

export default userQueries;
