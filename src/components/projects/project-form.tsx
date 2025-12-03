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
import { useState } from "react";
import { Course, Project } from "@/types/entities";
import { CreateProjectRequest, ProjectReferenceRequest } from "@/components/projects/types/types";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";
import fileUploadQueries from "@/repo/file-upload-queries/file-upload-queries";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import {
    Plus,
    Trash2,
    File as FileIcon,
    X,
    Upload,
    Link2,
    BookOpen,
    Loader2,
    FileText,
    FolderOpen,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectFormProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateProjectRequest) => void;
    isLoading: boolean;
    project?: Project | null;
    teamId: string;
}

export function ProjectForm({
    userId,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    project,
    teamId,
}: ProjectFormProps) {
    const [title, setTitle] = useState(project?.title || "");
    const [description, setDescription] = useState(project?.description || "");
    const [objectives, setObjectives] = useState(project?.objectives || "");
    const [githubUrl, setGithubUrl] = useState(project?.githubUrl || "");
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
        Array.isArray(project?.courseIds) ? project.courseIds : []
    );
    const [references, setReferences] = useState<ProjectReferenceRequest[]>(
        project?.references?.map((ref) => ({
            id: ref.id,
            title: ref.title,
            url: ref.url || undefined,
            description: ref.description || undefined,
        })) || []
    );
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [uploadedFilePaths, setUploadedFilePaths] = useState<string[]>(
        project?.uploadedFiles || []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const { error: toastError } = useToast();

    const { data: courses } = useQuery({
        queryKey: ["courses"],
        queryFn: () => courseQueries.getCourseByUserId(userId),
        enabled: isOpen,
        refetchOnMount: true,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

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

    const courseOptions: OptionType[] =
        courses?.map((course: Course) => ({
            value: course.id,
            label: `${course.name} (${course.code})`,
        })) || [];

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

                const validReferences = references.filter((ref) => ref.title.trim() !== "");

                onSubmit({
                    title,
                    description,
                    objectives: objectives || undefined,
                    githubUrl: githubUrl || undefined,
                    teamId,
                    courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
                    references: validReferences.length > 0 ? validReferences : undefined,
                    uploadedFiles:
                        [...uploadedFilePaths, ...newFilePaths].length > 0
                            ? [...uploadedFilePaths, ...newFilePaths]
                            : undefined,
                });
            } catch {
                toastError("Failed to upload some files. Please try again.");
            } finally {
                setIsUploading(false);
            }
        } else {
            const validReferences = references.filter((ref) => ref.title.trim() !== "");

            onSubmit({
                title,
                description,
                objectives: objectives || undefined,
                githubUrl: githubUrl || undefined,
                teamId,
                courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
                references: validReferences.length > 0 ? validReferences : undefined,
                uploadedFiles: uploadedFilePaths.length > 0 ? uploadedFilePaths : undefined,
            });
        }
    };

    const getFileName = (path: string) => {
        const parts = path.split("/");
        return parts[parts.length - 1];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[60vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project ? "Edit Project" : "Create Project"}</DialogTitle>
                    <DialogDescription>
                        {project
                            ? "Edit the project details."
                            : "Fill in the form to create a new project."}
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
                            <div>
                                <Label className="mb-2 block">Title</Label>
                                <Input
                                    placeholder="Project title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    minLength={3}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Description</Label>
                                <Textarea
                                    placeholder="Project description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Objectives</Label>
                                <Textarea
                                    placeholder="Project objectives"
                                    value={objectives}
                                    onChange={(e) => setObjectives(e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">GitHub URL (optional)</Label>
                                <Input
                                    type="url"
                                    placeholder="https://github.com/your-repo"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block">Courses (Multi-select)</Label>
                                <MultiSelect
                                    options={courseOptions}
                                    selected={selectedCourseIds}
                                    onChange={setSelectedCourseIds}
                                    placeholder="Select courses"
                                    className="w-full"
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isUploading}>
                            {isLoading || isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isUploading ? "Uploading..." : "Saving..."}
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
