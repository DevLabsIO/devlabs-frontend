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
import { Card } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import fileUploadQueries from "@/repo/file-upload-queries/file-upload-queries";
import { Upload, X, File as FileIcon, Loader2, FolderUp } from "lucide-react";

interface AddFilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (filePaths: string[]) => void;
    isLoading: boolean;
}

export function AddFilesModal({ isOpen, onClose, onSubmit, isLoading }: AddFilesModalProps) {
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pendingFiles.length === 0) {
            onClose();
            return;
        }

        setIsUploading(true);
        try {
            const uploadPromises = pendingFiles.map((file) => uploadMutation.mutateAsync(file));
            const results = await Promise.all(uploadPromises);
            const newFilePaths = results.map((r) => r.objectName);
            onSubmit(newFilePaths);
            setPendingFiles([]);
        } catch {
            toastError("Failed to upload some files. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setPendingFiles([]);
            setUploadProgress({});
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderUp className="h-5 w-5 text-primary" />
                        Upload Files
                    </DialogTitle>
                    <DialogDescription>
                        Upload project files, documents, or resources.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <p className="text-sm font-medium text-muted-foreground">
                                Selected files ({pendingFiles.length})
                            </p>
                            <div className="max-h-48 overflow-y-auto space-y-2">
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
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                    {uploadProgress[file.name] !== undefined && (
                                                        <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                                                            <div
                                                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
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
                                                onClick={() => handleRemovePendingFile(file.name)}
                                                disabled={uploadProgress[file.name] !== undefined}
                                                className="shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isLoading || isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploading || pendingFiles.length === 0}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload{" "}
                                    {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ""}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
