"use client";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ProjectWithTeam } from "@/types/entities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import KanbanBoardPage from "@/components/projects/kanban-board/kanban";
import ProjectReviews from "@/components/projects/reviews/ProjectReviews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Edit3, CheckCircle, RotateCcw } from "lucide-react";
import { useSessionContext } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { UpdateProjectForm } from "@/components/projects/update-project-form";
import { useState } from "react";

export default function DevlabsProjectPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const { user } = useSessionContext();
    const { success, error: toastError } = useToast();
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

    const {
        data: project,
        isLoading,
        error,
    } = useQuery<ProjectWithTeam>({
        queryKey: ["project", params.id],
        queryFn: () => projectQueries.fetchProjectByProjectId(params.id as string),
    });

    const reProposeProjectMutation = useMutation({
        mutationFn: () => projectQueries.reProposeProject(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("The project has been re-proposed successfully.");
        },
        onError: (error: Error) => {
            toastError(error.message || "Failed to re-propose project");
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: (updateData: {
            title?: string;
            description?: string;
            objectives?: string;
            githubUrl?: string;
        }) =>
            projectQueries.updateProject(params.id as string, {
                userId: user?.id || "",
                ...updateData,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project updated successfully.");
            setIsUpdateFormOpen(false);
        },
        onError: (error: Error) => {
            toastError(error.message || "Failed to update project");
        },
    });

    const completeProjectMutation = useMutation({
        mutationFn: () => projectQueries.completeProject(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project completed successfully.");
        },
        onError: (error: Error) => {
            toastError(error.message || "Failed to complete project");
        },
    });

    const revertCompletionMutation = useMutation({
        mutationFn: () => projectQueries.revertProjectCompletion(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project completion reverted successfully.");
        },
        onError: (error: Error) => {
            toastError(error.message || "Failed to revert project completion");
        },
    });

    const handleRepropose = () => {
        reProposeProjectMutation.mutate();
    };

    const handleUpdateProject = (updateData: {
        title?: string;
        description?: string;
        objectives?: string;
        githubUrl?: string;
    }) => {
        updateProjectMutation.mutate(updateData);
    };

    const handleCompleteProject = () => {
        completeProjectMutation.mutate();
    };

    const handleRevertCompletion = () => {
        revertCompletionMutation.mutate();
    };

    const isUserTeamMember = user && project?.teamMembers?.some((member) => member.id === user.id);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-96" />
                        <Skeleton className="h-6 w-24" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
                                    >
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-48" />
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
                                                    {Array.from({ length: 2 }).map(
                                                        (_, cardIndex) => (
                                                            <div
                                                                key={cardIndex}
                                                                className="bg-card border rounded-lg p-3"
                                                            >
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <div className="flex-1 space-y-2">
                                                                        <Skeleton className="h-4 w-full" />
                                                                        <Skeleton className="h-3 w-3/4" />
                                                                    </div>
                                                                    <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                                                                </div>
                                                                <Skeleton className="h-3 w-16 mt-2" />
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div>Error loading project: {error.message}</div>;
    }

    if (!project) {
        return <div>Project not found.</div>;
    }

    return (
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge
                                className={
                                    project.status === "ONGOING"
                                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                        : project.status === "COMPLETED"
                                          ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                          : project.status === "REJECTED"
                                            ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                            : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
                                }
                            >
                                {project.status === "ONGOING" ? "Live" : project.status}
                            </Badge>
                        </div>
                    </div>

                    {isUserTeamMember && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsUpdateFormOpen(true)}
                                className="flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Project
                            </Button>

                            {project.status === "ONGOING" && (
                                <Button
                                    onClick={handleCompleteProject}
                                    disabled={completeProjectMutation.isPending}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {completeProjectMutation.isPending ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 animate-spin" />
                                            Completing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Mark as Completed
                                        </>
                                    )}
                                </Button>
                            )}

                            {project.status === "COMPLETED" && (
                                <Button
                                    onClick={handleRevertCompletion}
                                    disabled={revertCompletionMutation.isPending}
                                    className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                    variant="outline"
                                >
                                    {revertCompletionMutation.isPending ? (
                                        <>
                                            <RotateCcw className="w-4 h-4 animate-spin" />
                                            Reverting...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4" />
                                            Revert to Live
                                        </>
                                    )}
                                </Button>
                            )}

                            {project.status === "REJECTED" && (
                                <Button
                                    onClick={handleRepropose}
                                    disabled={reProposeProjectMutation.isPending}
                                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                    {reProposeProjectMutation.isPending ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Re-proposing...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4" />
                                            Re-propose Project
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6 mb-12">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className="text-gray-400">{project.description}</p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-3">Team Members</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {project.teamMembers?.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.image || ""} />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{member.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {member.email}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Courses</h2>
                    <div className="flex flex-wrap gap-2">
                        {project.courses?.map((course) => (
                            <Badge key={course.id} variant="secondary">
                                {course.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <Card>
                    <CardHeader>
                        <CardTitle>Task Board</CardTitle>
                        <CardDescription>Manage your project&apos;s tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <KanbanBoardPage id={params.id as string} />
                    </CardContent>
                </Card>
            </div>

            {project.courses && project.courses.length > 0 && (
                <>
                    <Separator className="my-12" />
                    <div className="space-y-8">
                        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                        <ProjectReviews projectId={project.id} projectCourses={project.courses} />
                    </div>
                </>
            )}

            {isUserTeamMember && (
                <UpdateProjectForm
                    project={project}
                    isOpen={isUpdateFormOpen}
                    onClose={() => setIsUpdateFormOpen(false)}
                    onSubmit={handleUpdateProject}
                    isLoading={updateProjectMutation.isPending}
                />
            )}
        </main>
    );
}
