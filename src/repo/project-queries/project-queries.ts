import axiosInstance from "@/lib/axios/axios-client";
import { Course, Project, ProjectWithTeam } from "@/types/types";
import { CreateProjectRequest } from "@/components/projects/types/types";

export const projectQueries = {
  fetchProjectByTeamId: async (teamId: string): Promise<Project[]> => {
    const response = await axiosInstance.get(`/projects/team/${teamId}`);
    return response.data.data || response.data;
  },

  fetchProjectByProjectId: async (
    projectId: string
  ): Promise<ProjectWithTeam> => {
    const response = await axiosInstance.get(`/projects/${projectId}`);
    return response.data.data || response.data;
  },

  fetchProjectsByCourseId: async (courseId: string): Promise<Project[]> => {
    const response = await axiosInstance.get(`/projects/course/${courseId}`);
    return response.data.data || response.data;
  },

  createProject: async (project: CreateProjectRequest) => {
    const response = await axiosInstance.post("/projects", project);
    return response.data;
  },

  updateProject: async (project: Project) => {
    const response = await axiosInstance.put(
      `/projects/${project.id}`,
      project
    );
    return response.data;
  },

  deleteProject: async (projectId: string) => {
    const response = await axiosInstance.delete(`/projects/${projectId}`);
    return response.data;
  },

  getActiveProjects: async () => {
    const response = await axiosInstance.get("/projects/active");
    return response.data;
  },

  getActiveProjectsBySemester: async (semesterId: string) => {
    const response = await axiosInstance.get(
      `/projects/semester/${semesterId}/active`
    );
    return response.data;
  },

  getActiveProjectsByBatch: async (batchId: string) => {
    const response = await axiosInstance.get(
      `/projects/batch/${batchId}/active`
    );
    return response.data;
  },
  getProjectByCourse: async (
    userId: string,
    courseId: string
  ): Promise<Course[]> => {
    const response = await axiosInstance.get(
      `/project/user/${userId}/course/${courseId}`
    );
    return response.data;
  },

  searchProjectsByCourse: async (
    courseId: string,
    userId: string,
    query: string,
    page: number = 0,
    size: number = 10
  ): Promise<Project[]> => {
    const response = await axiosInstance.get(
      `/projects/course/${courseId}/search/${userId}`,
      {
        params: {
          query,
          page,
          size,
        },
      }
    );
    return response.data.data || response.data;
  },
};

export { archiveQueries } from "./archive-queries";
