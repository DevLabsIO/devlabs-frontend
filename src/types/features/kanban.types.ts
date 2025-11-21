import { User } from "../entities/user.types";

export interface KanbanTask {
    id: string;
    title: string;
    description?: string;
    position: number;
    createdBy: User;
    assignedTo?: User;
    createdAt: string;
    updatedAt: string;
}

export interface KanbanColumn {
    id: string;
    name: string;
    position: number;
    tasks: KanbanTask[];
    createdAt: string;
    updatedAt: string;
}

export interface KanbanBoard {
    id: string;
    projectId: string;
    columns: KanbanColumn[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateTaskRequest {
    title: string;
    description?: string;
    columnId: string;
    assignedToId?: string;
    userId: string;
}

export interface UpdateTaskRequest {
    title?: string;
    description?: string;
    assignedToId?: string;
    userId: string;
}

export interface MoveTaskRequest {
    columnId: string;
    position: number;
    userId: string;
}
