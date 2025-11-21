"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type KanbanItemProps,
  type KanbanColumnProps,
} from "@/components/kanban/kanban";
import { kanbanAPI } from "@/repo/project-queries/kanban-queries";
import { useState, useEffect } from "react";
import { AddTaskModal } from "./add-task-modal";
import { EditTaskModal } from "./edit-task-modal";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionContext } from "@/lib/session-context";
import { Edit, Trash2 } from "lucide-react";

interface KanbanBoardPageProps {
  id?: string;
}

interface EnhancedKanbanItem extends KanbanItemProps {
  name: string;
  description?: string;
  createdBy?: {
    id: string;
    name: string;
    image?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface EnhancedKanbanColumn extends KanbanColumnProps {
  color?: string;
}

function KanbanBoardSkeleton() {
  return (
    <div className="min-h-[400px] h-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div key={columnIndex} className="w-full">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>

              <div className="space-y-3">
                {Array.from({ length: 2 + (columnIndex % 2) }).map(
                  (_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="bg-card border rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                      </div>
                      <Skeleton className="h-3 w-16 mt-2" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoardPage({ id }: KanbanBoardPageProps) {
  const [kanbanTasks, setKanbanTasks] = useState<EnhancedKanbanItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<EnhancedKanbanItem | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { session } = useSessionContext();
  const {
    data: kanbanData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["kanbanBoard", id],
    queryFn: () => kanbanAPI.getKanbanBoard(id as string),
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  const moveTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      request,
    }: {
      taskId: string;
      request: { columnId: string; position: number; userId: string };
    }) => {
      return kanbanAPI.moveTask(taskId, request);
    },
    onSuccess: () => {},
    onError: (error) => {
      console.error("Failed to move task:", error);
      if (kanbanData) {
        const tasks: EnhancedKanbanItem[] = [];
        kanbanData.columns.forEach((column) => {
          column.tasks.forEach((task) => {
            tasks.push({
              id: task.id,
              name: task.title,
              column: column.id,
              description: task.description,
              createdBy: task.createdBy,
              assignedTo: task.assignedTo,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
            });
          });
        });
        setKanbanTasks(tasks);
      }
    },
  });

  const handleEditTask = (task: EnhancedKanbanItem) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const handleDeleteTask = (task: EnhancedKanbanItem) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  useEffect(() => {
    if (kanbanData) {
      const tasks: EnhancedKanbanItem[] = [];
      kanbanData.columns.forEach((column) => {
        column.tasks.forEach((task) => {
          tasks.push({
            id: task.id,
            name: task.title,
            column: column.id,
            description: task.description,
            createdBy: task.createdBy,
            assignedTo: task.assignedTo,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
          });
        });
      });
      setKanbanTasks(tasks);
    }
  }, [kanbanData]);
  const handleDataChange = async (newData: EnhancedKanbanItem[]) => {
    const previousTasks = [...kanbanTasks];
    setKanbanTasks(newData);
    let movedTask: EnhancedKanbanItem | undefined;
    let targetPosition = -1;

    movedTask = newData.find((newTask) => {
      const oldTask = previousTasks.find(
        (oldTask) => oldTask.id === newTask.id,
      );
      return oldTask && oldTask.column !== newTask.column;
    });

    if (!movedTask) {
      for (const newTask of newData) {
        const oldTask = previousTasks.find(
          (oldTask) => oldTask.id === newTask.id,
        );
        if (oldTask && oldTask.column === newTask.column) {
          const oldTasksInColumn = previousTasks.filter(
            (task) => task.column === oldTask.column,
          );
          const newTasksInColumn = newData.filter(
            (task) => task.column === newTask.column,
          );

          const oldPosition = oldTasksInColumn.findIndex(
            (task) => task.id === newTask.id,
          );
          const newPosition = newTasksInColumn.findIndex(
            (task) => task.id === newTask.id,
          );

          if (oldPosition !== newPosition) {
            movedTask = newTask;
            targetPosition = newPosition;
            break;
          }
        }
      }
    }

    if (movedTask) {
      const tasksInColumn = newData.filter(
        (task) => task.column === movedTask.column,
      );
      const position =
        targetPosition >= 0
          ? targetPosition
          : tasksInColumn.findIndex((task) => task.id === movedTask.id);

      moveTaskMutation.mutate({
        taskId: movedTask.id,
        request: {
          columnId: movedTask.column,
          position: position,
          userId: session?.user?.id || "",
        },
      });
    }
  };
  if (!id) {
    return <div>No project ID provided</div>;
  }

  if (isLoading) {
    return <KanbanBoardSkeleton />;
  }

  if (error) {
    return <div>Error loading Kanban Board: {error.message}</div>;
  }
  if (!kanbanData) {
    return <div>No kanban data available</div>;
  }

  const getColumnColor = (columnName: string) => {
    const colors: Record<string, string> = {
      "To Do": "#6B7280",
      Planned: "#6B7280",
      "In Progress": "#F59E0B",
      "In Review": "#8B5CF6",
      Done: "#10B981",
      Completed: "#10B981",
      Testing: "#3B82F6",
      Backlog: "#6B7280",
    };
    return colors[columnName] || "#6B7280";
  };
  const columns: EnhancedKanbanColumn[] = kanbanData.columns.map((col) => ({
    id: col.id,
    name: col.name,
    color: getColumnColor(col.name),
  }));

  const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return (
    <div>
      <KanbanProvider
        columns={columns}
        data={kanbanTasks}
        onDataChange={handleDataChange}
        className="min-h-[400px] h-auto"
      >
        {(column: EnhancedKanbanColumn) => (
          <KanbanBoard key={column.id} id={column.id}>
            <KanbanHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <span>{column.name}</span>
                </div>
                <AddTaskModal columnId={column.id} projectId={id!} />
              </div>
            </KanbanHeader>
            <KanbanCards id={column.id}>
              {(task: EnhancedKanbanItem) => (
                <KanbanCard key={task.id} {...task} className="group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p className="m-0 font-medium text-sm line-clamp-2">
                        {task.name}
                      </p>
                      {task.description && (
                        <p className="m-0 text-muted-foreground text-xs line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      {task.createdBy && (
                        <p className="m-0 text-muted-foreground text-xs">
                          {task.createdBy.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                        title="Edit task"
                      >
                        <Edit className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task);
                        }}
                        title="Delete task"
                      >
                        <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                      </Button>
                      {task.assignedTo && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignedTo.image} />
                          <AvatarFallback className="text-xs">
                            {task.assignedTo.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                  {(task.createdAt || task.updatedAt) && (
                    <p className="m-0 text-muted-foreground text-xs mt-2">
                      {task.createdAt &&
                      task.updatedAt &&
                      task.createdAt !== task.updatedAt
                        ? `${shortDateFormatter.format(
                            new Date(task.createdAt),
                          )} - ${shortDateFormatter.format(
                            new Date(task.updatedAt),
                          )}`
                        : shortDateFormatter.format(
                            new Date(task.createdAt || task.updatedAt),
                          )}
                    </p>
                  )}
                </KanbanCard>
              )}
            </KanbanCards>
          </KanbanBoard>
        )}
      </KanbanProvider>

      {selectedTask && (
        <EditTaskModal
          taskId={selectedTask.id}
          taskTitle={selectedTask.name}
          taskDescription={selectedTask.description}
          projectId={id!}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
        />
      )}

      {selectedTask && (
        <DeleteTaskDialog
          taskId={selectedTask.id}
          taskTitle={selectedTask.name}
          projectId={id!}
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        />
      )}
    </div>
  );
}
