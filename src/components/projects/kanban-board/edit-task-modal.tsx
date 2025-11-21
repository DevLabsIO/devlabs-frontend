"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kanbanAPI } from "@/repo/project-queries/kanban-queries";
import { useSessionContext } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { UpdateTaskRequest } from "@/types/features";
import { User } from "@/types/entities";

const editTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    assignedToId: z.string().optional(),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

interface EditTaskModalProps {
    taskId: string;
    taskTitle: string;
    taskDescription?: string;
    projectId: string;
    teamMembers?: User[];
    isOpen: boolean;
    onClose: () => void;
}

export function EditTaskModal({
    taskId,
    taskTitle,
    taskDescription,
    projectId,
    teamMembers: _teamMembers = [],
    isOpen,
    onClose,
}: EditTaskModalProps) {
    const { session } = useSessionContext();
    const { success, error: toastError } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<EditTaskFormValues>({
        resolver: zodResolver(editTaskSchema),
        defaultValues: {
            title: taskTitle,
            description: taskDescription || "",
        },
    });

    useEffect(() => {
        if (isOpen) {
            form.reset({
                title: taskTitle,
                description: taskDescription || "",
            });
        }
    }, [isOpen, taskTitle, taskDescription, form]);

    const updateTaskMutation = useMutation({
        mutationFn: (data: UpdateTaskRequest) => kanbanAPI.updateTask(taskId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kanbanBoard", projectId] });
            success("Task updated successfully");
            onClose();
        },
        onError: (error: Error) => {
            toastError(error.message || "Failed to update task");
        },
    });

    const onSubmit = (values: EditTaskFormValues) => {
        if (!session?.user?.id) {
            toastError("You must be logged in to update tasks");
            return;
        }

        const updateData: UpdateTaskRequest = {
            userId: session.user.id,
            ...(values.title !== taskTitle && { title: values.title }),
            ...(values.description !== taskDescription && {
                description: values.description,
            }),
        };

        updateTaskMutation.mutate(updateData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>Update the task details below.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter task title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter task description (optional)"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateTaskMutation.isPending}>
                                {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
