"use client";

import { projectQueries } from "@/repo/project-queries/project-queries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ProjectWithTeam } from "@/types/entities";
import { ProjectReferenceRequest } from "@/components/projects/types/types";
import KanbanBoardPage from "@/components/projects/kanban-board/kanban";
import ProjectReviews from "@/components/projects/reviews/ProjectReviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSessionContext } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { UpdateProjectForm } from "@/components/projects/update-project-form";
import { AddReferenceModal } from "@/components/projects/add-reference-modal";
import { AddFilesModal } from "@/components/projects/add-files-modal";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";
import { GROUPS } from "@/types/auth/roles";
import fileUploadQueries from "@/repo/file-upload-queries/file-upload-queries";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProjectAbout from "@/components/projects/project-details/project-about";
import ProjectHeader from "@/components/projects/project-details/project-header";
import ProjectReferences from "@/components/projects/project-details/project-references";
import ProjectFiles from "@/components/projects/project-details/project-files";
import ProjectSidebar from "@/components/projects/project-details/project-sidebar";
import ProjectPageSkeleton from "@/components/projects/project-details/project-loading-states";
import {
    ProjectError,
    ProjectNotFound,
} from "@/components/projects/project-details/project-loading-states";
import { getFileName } from "@/components/projects/project-details/status-config";

export default function DevlabsProjectPage() {
    const params = useParams();
    const queryClient = useQueryClient();
    const { user } = useSessionContext();
    const { success, error: toastError } = useToast();
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
    const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false);
    const [isAddFilesOpen, setIsAddFilesOpen] = useState(false);
    const [deleteReferenceIndex, setDeleteReferenceIndex] = useState<number | null>(null);
    const [deleteFilePath, setDeleteFilePath] = useState<string | null>(null);
    const [isDeletingFile, setIsDeletingFile] = useState(false);

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
        onError: (err: Error) => {
            toastError(err.message || "Failed to re-propose project");
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: (updateData: {
            title?: string;
            description?: string;
            objectives?: string;
            githubUrl?: string;
            references?: ProjectReferenceRequest[];
            uploadedFiles?: string[];
        }) =>
            projectQueries.updateProject(params.id as string, {
                userId: user?.id || "",
                ...updateData,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project updated successfully.");
            setIsUpdateFormOpen(false);
            setIsAddReferenceOpen(false);
            setIsAddFilesOpen(false);
        },
        onError: (err: Error) => {
            toastError(err.message || "Failed to update project");
        },
    });

    const completeProjectMutation = useMutation({
        mutationFn: () => projectQueries.completeProject(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project completed successfully.");
        },
        onError: (err: Error) => {
            toastError(err.message || "Failed to complete project");
        },
    });

    const revertCompletionMutation = useMutation({
        mutationFn: () => projectQueries.revertProjectCompletion(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project completion reverted successfully.");
        },
        onError: (err: Error) => {
            toastError(err.message || "Failed to revert project completion");
        },
    });

    const approveMutation = useMutation({
        mutationFn: () => projectQueries.approveProject(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project approved successfully.");
        },
        onError: (err: Error) => {
            toastError(err.message || "Failed to approve project");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: () => projectQueries.rejectProject(params.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", params.id] });
            success("Project rejected successfully.");
        },
        onError: (err: Error) => {
            toastError(err.message || "Failed to reject project");
        },
    });

    const handleAddReference = (reference: {
        title: string;
        url?: string;
        description?: string;
    }) => {
        const currentRefs = project?.references || [];
        const newReferences = [
            ...currentRefs.map((r) => ({
                id: r.id,
                title: r.title,
                url: r.url || undefined,
                description: r.description || undefined,
            })),
            reference,
        ];
        updateProjectMutation.mutate({ references: newReferences });
    };

    const handleRemoveReference = (index: number) => {
        const currentRefs = project?.references || [];
        const newReferences = currentRefs
            .filter((_, i) => i !== index)
            .map((r) => ({
                id: r.id,
                title: r.title,
                url: r.url || undefined,
                description: r.description || undefined,
            }));
        updateProjectMutation.mutate({ references: newReferences });
        setDeleteReferenceIndex(null);
    };

    const handleAddFiles = (newFilePaths: string[]) => {
        const currentFiles = project?.uploadedFiles || [];
        updateProjectMutation.mutate({ uploadedFiles: [...currentFiles, ...newFilePaths] });
    };

    const handleRemoveFile = async (filePath: string) => {
        setIsDeletingFile(true);
        try {
            await fileUploadQueries.deleteFile(filePath);
            const currentFiles = project?.uploadedFiles || [];
            updateProjectMutation.mutate({
                uploadedFiles: currentFiles.filter((f) => f !== filePath),
            });
            success("File deleted successfully.");
        } catch {
            toastError("Failed to delete file. Please try again.");
        } finally {
            setIsDeletingFile(false);
            setDeleteFilePath(null);
        }
    };

    const handleOpenFile = async (objectName: string) => {
        try {
            const { downloadUrl } = await fileUploadQueries.getDownloadUrl(objectName);
            window.open(downloadUrl, "_blank", "noopener,noreferrer");
        } catch {
            toastError("Failed to open file");
        }
    };

    const handleDownloadFile = async (objectName: string) => {
        try {
            const { downloadUrl } = await fileUploadQueries.getDownloadUrl(objectName);
            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Failed to fetch file");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = getFileName(objectName);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            toastError("Failed to download file");
        }
    };

    const isUserTeamMember = user && project?.teamMembers?.some((member) => member.id === user.id);
    const userGroups = (user?.groups as string[]) || [];
    const isFacultyOrAbove =
        userGroups.includes(GROUPS.ADMIN) ||
        userGroups.includes(GROUPS.MANAGER) ||
        userGroups.includes(GROUPS.FACULTY);
    const isStudent = userGroups.includes(GROUPS.STUDENT);
    const canEdit = isStudent && isUserTeamMember;

    if (isLoading) return <ProjectPageSkeleton />;
    if (error) return <ProjectError message={error.message} />;
    if (!project) return <ProjectNotFound />;

    return (
        <TooltipProvider>
            <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <ProjectHeader
                        title={project.title}
                        status={project.status}
                        createdAt={project.createdAt}
                        isFacultyOrAbove={isFacultyOrAbove}
                        canEdit={canEdit}
                        isApprovePending={approveMutation.isPending}
                        isRejectPending={rejectMutation.isPending}
                        isCompletePending={completeProjectMutation.isPending}
                        isRevertPending={revertCompletionMutation.isPending}
                        isReProposePending={reProposeProjectMutation.isPending}
                        onApprove={() => approveMutation.mutate()}
                        onReject={() => rejectMutation.mutate()}
                        onEdit={() => setIsUpdateFormOpen(true)}
                        onComplete={() => completeProjectMutation.mutate()}
                        onRevert={() => revertCompletionMutation.mutate()}
                        onRePropose={() => reProposeProjectMutation.mutate()}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2 space-y-6">
                            <ProjectAbout
                                description={project.description}
                                objectives={project.objectives}
                                githubUrl={project.githubUrl}
                            />

                            <ProjectReferences
                                references={project.references || []}
                                canEdit={canEdit}
                                isLoading={updateProjectMutation.isPending}
                                onAddClick={() => setIsAddReferenceOpen(true)}
                                onDeleteClick={(index) => setDeleteReferenceIndex(index)}
                            />

                            <ProjectFiles
                                files={project.uploadedFiles || []}
                                canEdit={canEdit}
                                isLoading={updateProjectMutation.isPending}
                                onAddClick={() => setIsAddFilesOpen(true)}
                                onDeleteClick={(filePath) => setDeleteFilePath(filePath)}
                                onOpenFile={handleOpenFile}
                                onDownloadFile={handleDownloadFile}
                            />
                        </div>

                        <ProjectSidebar
                            teamMembers={project.teamMembers || []}
                            courses={project.courses || []}
                        />
                    </div>

                    <Card className="border-0 shadow-sm mb-8">
                        <CardHeader>
                            <CardTitle className="text-xl">Task Board</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Manage and track your project tasks
                            </p>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <KanbanBoardPage id={params.id as string} />
                        </CardContent>
                    </Card>

                    {project.courses && project.courses.length > 0 && (
                        <>
                            <Separator className="my-8" />
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
                                <ProjectReviews
                                    projectId={project.id}
                                    projectCourses={project.courses}
                                />
                            </div>
                        </>
                    )}
                </div>

                {canEdit && (
                    <>
                        <UpdateProjectForm
                            project={project}
                            isOpen={isUpdateFormOpen}
                            onClose={() => setIsUpdateFormOpen(false)}
                            onSubmit={(data) => updateProjectMutation.mutate(data)}
                            isLoading={updateProjectMutation.isPending}
                        />

                        <AddReferenceModal
                            isOpen={isAddReferenceOpen}
                            onClose={() => setIsAddReferenceOpen(false)}
                            onSubmit={handleAddReference}
                            isLoading={updateProjectMutation.isPending}
                        />

                        <AddFilesModal
                            isOpen={isAddFilesOpen}
                            onClose={() => setIsAddFilesOpen(false)}
                            onSubmit={handleAddFiles}
                            isLoading={updateProjectMutation.isPending}
                        />

                        <DeleteDialog
                            isOpen={deleteReferenceIndex !== null}
                            onClose={() => setDeleteReferenceIndex(null)}
                            onConfirm={() =>
                                deleteReferenceIndex !== null &&
                                handleRemoveReference(deleteReferenceIndex)
                            }
                            title="Delete Reference"
                            description="Are you sure you want to remove this reference? This action cannot be undone."
                            isLoading={updateProjectMutation.isPending}
                        />

                        <DeleteDialog
                            isOpen={deleteFilePath !== null}
                            onClose={() => !isDeletingFile && setDeleteFilePath(null)}
                            onConfirm={() =>
                                deleteFilePath !== null && handleRemoveFile(deleteFilePath)
                            }
                            title="Delete File"
                            description="Are you sure you want to remove this file? This will permanently delete the file from storage and cannot be undone."
                            isLoading={isDeletingFile}
                        />
                    </>
                )}
            </main>
        </TooltipProvider>
    );
}
