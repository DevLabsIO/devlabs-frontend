"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kanbanAPI } from "@/repo/project-queries/kanban-queries";
import { useState, useRef } from "react";
import { AddTaskModal } from "./add-task-modal";
import { EditTaskModal } from "./edit-task-modal";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSessionContext } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import { Edit, GripVertical, Trash2 } from "lucide-react";
import { KanbanTask, KanbanColumn } from "@/types/features";

interface KanbanBoardPageProps {
    id?: string;
}

interface DragState {
    taskId: string;
    task: KanbanTask;
    sourceColumnId: string;
    sourceIndex: number;
}

const COLUMN_COLORS: Record<string, string> = {
    "To Do": "#6B7280",
    Planned: "#6B7280",
    "In Progress": "#F59E0B",
    "In Review": "#8B5CF6",
    Done: "#10B981",
    Completed: "#10B981",
    Testing: "#3B82F6",
    Backlog: "#6B7280",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

function KanbanBoardSkeleton() {
    return (
        <div className="min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 3 }).map((_, columnIndex) => (
                    <div key={columnIndex} className="w-full min-w-[280px] max-w-[320px]">
                        <div className="bg-muted/50 rounded-lg border min-h-[420px]">
                            <div className="flex items-center justify-between p-3 border-b">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-2 w-2 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded" />
                            </div>
                            <div className="p-2 space-y-2">
                                {Array.from({ length: 2 + (columnIndex % 2) }).map(
                                    (_, cardIndex) => (
                                        <div
                                            key={cardIndex}
                                            className="bg-card border rounded-lg p-3"
                                        >
                                            <div className="flex items-start gap-2">
                                                <Skeleton className="h-4 w-4 shrink-0 mt-0.5" />
                                                <div className="flex-1 space-y-2 min-w-0">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-3 w-3/4" />
                                                </div>
                                                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface GhostPreviewCardProps {
    task: KanbanTask;
}

function GhostPreviewCard({ task }: GhostPreviewCardProps) {
    return (
        <Card
            className="p-3 shadow-sm bg-primary/10 border-primary/30 border-2 opacity-70 overflow-hidden"
            style={{ maxWidth: "288px" }}
        >
            <div className="flex items-start gap-2 overflow-hidden">
                <GripVertical className="h-4 w-4 text-primary/50 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                    <div
                        className="font-medium text-sm leading-tight text-primary/80 truncate"
                        title={task.title}
                    >
                        {task.title}
                    </div>
                    {task.description && (
                        <div className="text-primary/60 text-xs truncate" title={task.description}>
                            {task.description}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}

interface TaskCardProps {
    task: KanbanTask;
    columnId: string;
    index: number;
    isDragging: boolean;
    isDropTarget: boolean;
    dropPosition: "before" | "after" | null;
    draggedTask: KanbanTask | null;
    onDragStart: (task: KanbanTask, columnId: string, index: number) => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent, columnId: string, index: number) => void;
    onDrop: (e: React.DragEvent, columnId: string, index: number) => void;
    onEdit: (task: KanbanTask, columnId: string) => void;
    onDelete: (task: KanbanTask) => void;
}

function TaskCard({
    task,
    columnId,
    index,
    isDragging,
    isDropTarget,
    dropPosition,
    draggedTask,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
    onEdit,
    onDelete,
}: TaskCardProps) {
    const hasLongTitle = task.title && task.title.length > 40;
    const hasLongDescription = task.description && task.description.length > 40;

    return (
        <div
            className="relative w-full"
            onDragOver={(e) => onDragOver(e, columnId, index)}
            onDrop={(e) => onDrop(e, columnId, index)}
        >
            {isDropTarget && dropPosition === "before" && draggedTask && (
                <div className="mb-2 w-full">
                    <GhostPreviewCard task={draggedTask} />
                </div>
            )}
            <Card
                draggable
                onDragStart={() => onDragStart(task, columnId, index)}
                onDragEnd={onDragEnd}
                className={cn(
                    "group cursor-grab rounded-lg p-3 shadow-sm bg-card border-border hover:shadow-md transition-all duration-200 active:cursor-grabbing overflow-hidden",
                    isDragging && "opacity-30 scale-95"
                )}
                style={{ width: "100%", maxWidth: "288px" }}
            >
                <div className="flex items-start gap-2 overflow-hidden">
                    <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex-1 min-w-0 space-y-1">
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="font-medium text-sm leading-tight truncate cursor-default"
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                </TooltipTrigger>
                                {hasLongTitle && (
                                    <TooltipContent
                                        side="top"
                                        align="start"
                                        className="max-w-[250px]"
                                    >
                                        <p className="text-sm wrap-break-word">{task.title}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                        {task.description && (
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className="text-muted-foreground text-xs truncate cursor-default"
                                            title={task.description}
                                        >
                                            {task.description}
                                        </div>
                                    </TooltipTrigger>
                                    {hasLongDescription && (
                                        <TooltipContent
                                            side="bottom"
                                            align="start"
                                            className="max-w-[250px]"
                                        >
                                            <p className="text-sm wrap-break-word whitespace-pre-wrap">
                                                {task.description}
                                            </p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {task.createdBy && (
                                <span className="truncate max-w-[100px]">
                                    {task.createdBy.name}
                                </span>
                            )}
                            {task.createdAt && (
                                <>
                                    <span className="shrink-0">•</span>
                                    <span className="shrink-0">
                                        {DATE_FORMATTER.format(new Date(task.createdAt))}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task, columnId);
                            }}
                        >
                            <Edit className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task);
                            }}
                        >
                            <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </Button>
                        {task.assignedTo && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assignedTo.image} />
                                            <AvatarFallback className="text-xs">
                                                {task.assignedTo.name?.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{task.assignedTo.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>
            </Card>
            {isDropTarget && dropPosition === "after" && draggedTask && (
                <div className="mt-2 w-full">
                    <GhostPreviewCard task={draggedTask} />
                </div>
            )}
        </div>
    );
}

interface KanbanColumnComponentProps {
    column: KanbanColumn;
    projectId: string;
    dragState: DragState | null;
    dropTarget: { columnId: string; index: number; position: "before" | "after" } | null;
    onDragStart: (task: KanbanTask, columnId: string, index: number) => void;
    onDragEnd: () => void;
    onDragOver: (e: React.DragEvent, columnId: string, index: number) => void;
    onDragOverEmpty: (e: React.DragEvent, columnId: string) => void;
    onDrop: (e: React.DragEvent, columnId: string, index: number) => void;
    onDropEmpty: (e: React.DragEvent, columnId: string) => void;
    onEditTask: (task: KanbanTask, columnId: string) => void;
    onDeleteTask: (task: KanbanTask) => void;
}

function KanbanColumnComponent({
    column,
    projectId,
    dragState,
    dropTarget,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragOverEmpty,
    onDrop,
    onDropEmpty,
    onEditTask,
    onDeleteTask,
}: KanbanColumnComponentProps) {
    const columnColor = COLUMN_COLORS[column.name] || "#6B7280";
    const isColumnDropTarget = dropTarget?.columnId === column.id;
    const hasNoTasks = column.tasks.length === 0;
    const isDragActive = dragState !== null;

    return (
        <div
            className={cn(
                "flex flex-col rounded-lg border bg-muted/30 overflow-hidden transition-all duration-200 w-[320px] min-w-[320px] max-w-[320px] min-h-[430px]",
                isDragActive && isColumnDropTarget && "ring-2 ring-primary"
            )}
        >
            <div className="flex items-center justify-between p-3 border-b bg-card/50">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: columnColor }}
                    />
                    <span className="font-medium text-sm truncate">{column.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {column.tasks.length}
                    </span>
                </div>
                <AddTaskModal columnId={column.id} projectId={projectId} />
            </div>
            <ScrollArea className="flex-1 max-h-[500px] w-full">
                <div
                    className={cn(
                        "p-2 space-y-2 min-h-[200px] transition-colors duration-200 w-[304px]",
                        isDragActive && isColumnDropTarget && hasNoTasks && "bg-primary/5"
                    )}
                    onDragOver={(e) => {
                        if (hasNoTasks) {
                            onDragOverEmpty(e, column.id);
                        }
                    }}
                    onDrop={(e) => {
                        if (hasNoTasks) {
                            onDropEmpty(e, column.id);
                        }
                    }}
                >
                    {column.tasks.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            columnId={column.id}
                            index={index}
                            isDragging={dragState?.taskId === task.id}
                            isDropTarget={
                                dropTarget?.columnId === column.id && dropTarget?.index === index
                            }
                            dropPosition={
                                dropTarget?.columnId === column.id && dropTarget?.index === index
                                    ? dropTarget.position
                                    : null
                            }
                            draggedTask={dragState?.task || null}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                        />
                    ))}
                    {hasNoTasks && isDragActive && dragState?.task && (
                        <GhostPreviewCard task={dragState.task} />
                    )}
                    {hasNoTasks && !isDragActive && (
                        <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
                            No tasks yet
                        </div>
                    )}
                </div>
                <ScrollBar orientation="vertical" />
            </ScrollArea>
        </div>
    );
}

export default function KanbanBoardPage({ id }: KanbanBoardPageProps) {
    const [selectedTask, setSelectedTask] = useState<{
        task: KanbanTask;
        columnId: string;
    } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [dropTarget, setDropTarget] = useState<{
        columnId: string;
        index: number;
        position: "before" | "after";
    } | null>(null);

    const { session } = useSessionContext();
    const queryClient = useQueryClient();
    const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const moveTaskMutation = useMutation({
        mutationFn: ({
            taskId,
            request,
        }: {
            taskId: string;
            request: { columnId: string; position: number; userId: string };
        }) => kanbanAPI.moveTask(taskId, request),
        onMutate: async ({ taskId, request }) => {
            await queryClient.cancelQueries({ queryKey: ["kanbanBoard", id] });
            const previousData = queryClient.getQueryData(["kanbanBoard", id]);

            queryClient.setQueryData(["kanbanBoard", id], (old: typeof kanbanData) => {
                if (!old) return old;

                let movedTask: KanbanTask | undefined;
                const columnsWithoutTask = old.columns.map((column) => {
                    const taskIndex = column.tasks.findIndex((t) => t.id === taskId);
                    if (taskIndex !== -1) {
                        movedTask = column.tasks[taskIndex];
                        return {
                            ...column,
                            tasks: column.tasks.filter((t) => t.id !== taskId),
                        };
                    }
                    return column;
                });

                if (!movedTask) return old;

                const updatedColumns = columnsWithoutTask.map((column) => {
                    if (column.id === request.columnId) {
                        const newTasks = [...column.tasks];
                        newTasks.splice(request.position, 0, movedTask!);
                        return { ...column, tasks: newTasks };
                    }
                    return column;
                });

                return { ...old, columns: updatedColumns };
            });

            return { previousData };
        },
        onError: (_error, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(["kanbanBoard", id], context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard", id] });
        },
    });

    const handleDragStart = (task: KanbanTask, columnId: string, index: number) => {
        setDragState({ taskId: task.id, task, sourceColumnId: columnId, sourceIndex: index });
    };

    const handleDragEnd = () => {
        if (dragTimeoutRef.current) {
            clearTimeout(dragTimeoutRef.current);
        }
        setDragState(null);
        setDropTarget(null);
    };

    const handleDragOver = (e: React.DragEvent, columnId: string, index: number) => {
        e.preventDefault();
        if (!dragState) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? "before" : "after";

        if (
            dropTarget?.columnId !== columnId ||
            dropTarget?.index !== index ||
            dropTarget?.position !== position
        ) {
            setDropTarget({ columnId, index, position });
        }
    };

    const handleDragOverEmpty = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (!dragState) return;

        if (dropTarget?.columnId !== columnId || dropTarget?.index !== 0) {
            setDropTarget({ columnId, index: 0, position: "before" });
        }
    };

    const handleDrop = (e: React.DragEvent, columnId: string, index: number) => {
        e.preventDefault();
        if (!dragState || !session?.user?.id) return;

        const isSameColumn = dragState.sourceColumnId === columnId;
        const rect = e.currentTarget.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dropBefore = e.clientY < midY;

        let targetPosition: number;

        if (isSameColumn) {
            if (dropBefore) {
                targetPosition = index > dragState.sourceIndex ? index - 1 : index;
            } else {
                targetPosition = index >= dragState.sourceIndex ? index : index + 1;
            }

            if (targetPosition === dragState.sourceIndex) {
                handleDragEnd();
                return;
            }
        } else {
            targetPosition = dropBefore ? index : index + 1;
        }

        targetPosition = Math.max(0, targetPosition);

        moveTaskMutation.mutate({
            taskId: dragState.taskId,
            request: {
                columnId,
                position: targetPosition,
                userId: session.user.id,
            },
        });

        handleDragEnd();
    };

    const handleDropEmpty = (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (!dragState || !session?.user?.id) return;

        moveTaskMutation.mutate({
            taskId: dragState.taskId,
            request: {
                columnId,
                position: 0,
                userId: session.user.id,
            },
        });

        handleDragEnd();
    };

    const handleEditTask = (task: KanbanTask, columnId: string) => {
        setSelectedTask({ task, columnId });
        setIsEditModalOpen(true);
    };

    const handleDeleteTask = (task: KanbanTask) => {
        setSelectedTask({ task, columnId: "" });
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

    if (!id) {
        return (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No project ID provided
            </div>
        );
    }

    if (isLoading) {
        return <KanbanBoardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[400px] text-destructive">
                Error loading Kanban Board: {error.message}
            </div>
        );
    }

    if (!kanbanData) {
        return (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                No kanban data available
            </div>
        );
    }

    return (
        <div className="min-h-[400px]">
            <ScrollArea className="w-full">
                <div className="flex gap-4 p-1">
                    {kanbanData.columns.map((column) => (
                        <KanbanColumnComponent
                            key={column.id}
                            column={column}
                            projectId={id}
                            dragState={dragState}
                            dropTarget={dropTarget}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            onDragOverEmpty={handleDragOverEmpty}
                            onDrop={handleDrop}
                            onDropEmpty={handleDropEmpty}
                            onEditTask={handleEditTask}
                            onDeleteTask={handleDeleteTask}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {selectedTask && (
                <EditTaskModal
                    taskId={selectedTask.task.id}
                    taskTitle={selectedTask.task.title}
                    taskDescription={selectedTask.task.description}
                    projectId={id}
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                />
            )}

            {selectedTask && (
                <DeleteTaskDialog
                    taskId={selectedTask.task.id}
                    taskTitle={selectedTask.task.title}
                    projectId={id}
                    isOpen={isDeleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                />
            )}
        </div>
    );
}
