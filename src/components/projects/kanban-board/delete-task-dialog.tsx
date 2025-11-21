"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kanbanAPI } from "@/repo/project-queries/kanban-queries";
import { useToast } from "@/hooks/use-toast";

interface DeleteTaskDialogProps {
    taskId: string;
    taskTitle: string;
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteTaskDialog({
    taskId,
    taskTitle,
    projectId,
    isOpen,
    onClose,
}: DeleteTaskDialogProps) {
    const { success, error: toastError } = useToast();
    const queryClient = useQueryClient();

    const deleteTaskMutation = useMutation({
        mutationFn: () => kanbanAPI.deleteTask(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard", projectId] });
            success("Task deleted successfully");
            onClose();
        },
        onError: (error: Error) => {
            toastError(error.message || "Failed to delete task");
        },
    });

    const handleDelete = () => {
        deleteTaskMutation.mutate();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete &quot;{taskTitle}&quot;? This action cannot
                        be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteTaskMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
