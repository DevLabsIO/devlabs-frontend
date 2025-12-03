"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ProjectWithTeam } from "@/types/entities";
import { ProjectReferenceRequest } from "@/components/projects/types/types";
import { FileUpload } from "@/components/ui/file-upload";
import fileUploadQueries from "@/repo/file-upload-queries/file-upload-queries";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import {
    Edit3,
    Save,
    X,
    Plus,
    Trash2,
    File as FileIcon,
    Upload,
    Link2,
    BookOpen,
    Loader2,
    FileText,
    FolderOpen,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFileName } from "@/components/projects/project-details/status-config";

interface UpdateProjectFormProps {
    project: ProjectWithTeam;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title?: string;
        description?: string;
        objectives?: string;
        githubUrl?: string;
        references?: ProjectReferenceRequest[];
        uploadedFiles?: string[];
    }) => void;
    isLoading: boolean;
}

export function UpdateProjectForm({
    project,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: UpdateProjectFormProps) {
    const [formData, setFormData] = useState({
        title: project.title || "",
        description: project.description || "",
        objectives: project.objectives || "",
        githubUrl: project.githubUrl || "",
    });
    const [references, setReferences] = useState<ProjectReferenceRequest[]>(
        project.references?.map((ref) => ({
            id: ref.id,
            title: ref.title,
            url: ref.url || "",
            description: ref.description || "",
        })) || []
    );
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [uploadedFilePaths, setUploadedFilePaths] = useState<string[]>(
        project.uploadedFiles || []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const { error: toastError } = useToast();

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            return fileUploadQueries.uploadFile(file, (progress) => {
                setUploadProgress((prev) => ({
                    ...prev,
                    [file.name]: progress,
                }));
            });
        },
        onSuccess: (data, file) => {
            setUploadedFilePaths((prev) => [...prev, data.objectName]);
            setPendingFiles((prev) => prev.filter((f) => f.name !== file.name));
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
            });
        },
        onError: (err: Error, file) => {
            toastError(`Failed to upload ${file.name}: ${err.message}`);
            setUploadProgress((prev) => {
                const newProgress = { ...prev };
                delete newProgress[file.name];
                return newProgress;
            });
        },
    });

    const handleFileSelect = (file: File) => {
        if (pendingFiles.some((f) => f.name === file.name)) {
            toastError(`File "${file.name}" is already selected.`);
            return;
        }
        setPendingFiles((prev) => [...prev, file]);
    };

    const handleRemovePendingFile = (fileName: string) => {
        setPendingFiles((prev) => prev.filter((f) => f.name !== fileName));
    };

    const handleRemoveUploadedFile = (filePath: string) => {
        setUploadedFilePaths((prev) => prev.filter((f) => f !== filePath));
    };

    const handleAddReference = () => {
        setReferences((prev) => [...prev, { title: "", url: "", description: "" }]);
    };

    const handleRemoveReference = (index: number) => {
        setReferences((prev) => prev.filter((_, i) => i !== index));
    };

    const handleReferenceChange = (
        index: number,
        field: keyof ProjectReferenceRequest,
        value: string
    ) => {
        setReferences((prev) =>
            prev.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pendingFiles.length > 0) {
            setIsUploading(true);
            try {
                const uploadPromises = pendingFiles.map((file) => uploadMutation.mutateAsync(file));
                const results = await Promise.all(uploadPromises);
                const newFilePaths = results.map((r) => r.objectName);

                const updates = buildUpdates([...uploadedFilePaths, ...newFilePaths]);
                if (Object.keys(updates).length > 0) {
                    onSubmit(updates);
                } else {
                    onClose();
                }
            } catch {
                toastError("Failed to upload some files. Please try again.");
            } finally {
                setIsUploading(false);
            }
        } else {
            const updates = buildUpdates(uploadedFilePaths);
            if (Object.keys(updates).length > 0) {
                onSubmit(updates);
            } else {
                onClose();
            }
        }
    };

    const buildUpdates = (finalFilePaths: string[]) => {
        const updates: {
            title?: string;
            description?: string;
            objectives?: string;
            githubUrl?: string;
            references?: ProjectReferenceRequest[];
            uploadedFiles?: string[];
        } = {};

        if (formData.title !== project.title) updates.title = formData.title;
        if (formData.description !== project.description)
            updates.description = formData.description;
        if (formData.objectives !== project.objectives) updates.objectives = formData.objectives;
        if (formData.githubUrl !== project.githubUrl) updates.githubUrl = formData.githubUrl;

        const validReferences = references.filter((ref) => ref.title.trim() !== "");
        const originalRefs = project.references || [];
        const refsChanged =
            JSON.stringify(validReferences) !==
            JSON.stringify(
                originalRefs.map((r) => ({
                    id: r.id,
                    title: r.title,
                    url: r.url || "",
                    description: r.description || "",
                }))
            );
        if (refsChanged) {
            updates.references = validReferences;
        }

        const originalFiles = project.uploadedFiles || [];
        const filesChanged =
            JSON.stringify(finalFilePaths.sort()) !== JSON.stringify(originalFiles.sort());
        if (filesChanged) {
            updates.uploadedFiles = finalFilePaths;
        }

        return updates;
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[60vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5" />
                        Update Project
                    </DialogTitle>
                    <DialogDescription>
                        Update your project details. Only modified fields will be updated.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Tabs defaultValue="metadata" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="metadata" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Metadata
                            </TabsTrigger>
                            <TabsTrigger value="resources" className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Resources
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="metadata" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    placeholder="Enter project title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleChange("description", e.target.value)}
                                    placeholder="Enter project description"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="objectives">Objectives</Label>
                                <Textarea
                                    id="objectives"
                                    value={formData.objectives}
                                    onChange={(e) => handleChange("objectives", e.target.value)}
                                    placeholder="Enter project objectives"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="githubUrl">GitHub URL</Label>
                                <Input
                                    id="githubUrl"
                                    type="url"
                                    value={formData.githubUrl}
                                    onChange={(e) => handleChange("githubUrl", e.target.value)}
                                    placeholder="https://github.com/your-repo"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="resources" className="space-y-6 mt-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        References
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddReference}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Reference
                                    </Button>
                                </div>

                                {references.length > 0 && (
                                    <div className="space-y-3">
                                        {references.map((ref, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 space-y-3">
                                                            <Input
                                                                placeholder="Reference title"
                                                                value={ref.title}
                                                                onChange={(e) =>
                                                                    handleReferenceChange(
                                                                        index,
                                                                        "title",
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                                                <Input
                                                                    type="url"
                                                                    placeholder="URL (optional)"
                                                                    value={ref.url || ""}
                                                                    onChange={(e) =>
                                                                        handleReferenceChange(
                                                                            index,
                                                                            "url",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                            <Textarea
                                                                placeholder="Description (optional)"
                                                                value={ref.description || ""}
                                                                onChange={(e) =>
                                                                    handleReferenceChange(
                                                                        index,
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleRemoveReference(index)
                                                            }
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    Project Files
                                </Label>

                                <FileUpload
                                    onFileSelect={handleFileSelect}
                                    onFileRemove={() => {}}
                                    maxSizeInMB={70}
                                    disabled={isUploading || isLoading}
                                    multiple={true}
                                    onValidationError={(err) => toastError(err)}
                                />

                                {pendingFiles.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Files to upload ({pendingFiles.length})
                                        </p>
                                        {pendingFiles.map((file) => (
                                            <Card key={file.name} className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <FileIcon className="h-5 w-5 text-blue-500 shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(
                                                                    file.size /
                                                                    (1024 * 1024)
                                                                ).toFixed(2)}{" "}
                                                                MB
                                                            </p>
                                                            {uploadProgress[file.name] !==
                                                                undefined && (
                                                                <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                                                                    <div
                                                                        className="bg-blue-600 h-1 rounded-full transition-all"
                                                                        style={{
                                                                            width: `${uploadProgress[file.name]}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemovePendingFile(file.name)
                                                        }
                                                        disabled={
                                                            uploadProgress[file.name] !== undefined
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {uploadedFilePaths.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Uploaded files ({uploadedFilePaths.length})
                                        </p>
                                        {uploadedFilePaths.map((filePath) => (
                                            <Card key={filePath} className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <FileIcon className="h-5 w-5 text-green-500 shrink-0" />
                                                        <p className="text-sm font-medium truncate">
                                                            {getFileName(filePath)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRemoveUploadedFile(filePath)
                                                        }
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading || isUploading}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isUploading}>
                            {isLoading || isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isUploading ? "Uploading..." : "Updating..."}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Project
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
