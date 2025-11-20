import { Batch, Department } from "@/types/entities";
import {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentResponse,
  PaginatedResponse,
} from "@/types/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios/axios-client";

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateDepartmentRequest,
    ): Promise<DepartmentResponse> => {
      const response = await axiosInstance.post("/api/department", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: UpdateDepartmentRequest,
    ): Promise<DepartmentResponse> => {
      const { id, ...updateData } = data;
      const response = await axiosInstance.put(
        `/api/department/${id}`,
        updateData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string): Promise<void> => {
      await axiosInstance.delete(`/api/department/${departmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useSearchDepartments = () => {
  return useMutation({
    mutationFn: async (params: {
      query: string;
      page?: number;
      size?: number;
    }): Promise<PaginatedResponse<DepartmentResponse>> => {
      const response = await axiosInstance.get("/api/department/search", {
        params,
      });
      return response.data;
    },
  });
};

export const useGetDepartmentBatches = () => {
  return useMutation({
    mutationFn: async (departmentId: string) => {
      const response = await axiosInstance.get(
        `/api/department/${departmentId}/batches`,
      );
      return response.data;
    },
  });
};

export const getAllDepartments = async (): Promise<Department[]> => {
  const response = await axiosInstance.get("/api/department/all");
  const data = response.data;
  return data || [];
};

export const getBatchesByDepartment = async (
  departmentId: string,
): Promise<Batch[]> => {
  const response = await axiosInstance.get(
    `/api/department/${departmentId}/batches`,
  );
  return response.data;
};
