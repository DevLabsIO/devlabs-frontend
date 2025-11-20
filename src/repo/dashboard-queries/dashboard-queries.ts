import axiosInstance from "@/lib/axios/axios-client";
import {
  AdminDashboardData,
  ManagerStaffDashboardData,
  StudentDashboardData,
} from "@/types/features";

export const dashboardQueries = {
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const response = await axiosInstance.get("/api/dashboard/admin");
    return response.data;
  },

  getManagerStaffDashboard: async (): Promise<ManagerStaffDashboardData> => {
    const response = await axiosInstance.get("/api/dashboard/manager-staff");
    return response.data;
  },

  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const response = await axiosInstance.get("/api/dashboard/student");
    return response.data;
  },
};
