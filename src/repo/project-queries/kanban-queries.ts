import axiosInstance from "@/lib/axios/axios-client";
import {
  KanbanBoard,
  KanbanTask,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from "@/types/features";

export const kanbanAPI = {
  getKanbanBoard: async (projectId: string): Promise<KanbanBoard> => {
    const response = await axiosInstance.get(`/kanban/project/${projectId}`);
    return response.data;
  },

  createTask: async (request: CreateTaskRequest): Promise<KanbanTask> => {
    const response = await axiosInstance.post("/kanban/tasks", request);
    return response.data;
  },

  updateTask: async (
    taskId: string,
    request: UpdateTaskRequest,
  ): Promise<KanbanTask> => {
    const response = await axiosInstance.put(
      `/kanban/tasks/${taskId}`,
      request,
    );
    return response.data;
  },

  moveTask: async (
    taskId: string,
    request: MoveTaskRequest,
  ): Promise<KanbanTask> => {
    const response = await axiosInstance.put(
      `/kanban/tasks/${taskId}/move`,
      request,
    );
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await axiosInstance.delete(`/kanban/tasks/${taskId}`);
  },
};
