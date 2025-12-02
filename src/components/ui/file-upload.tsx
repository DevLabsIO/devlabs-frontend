"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, File, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    maxSizeInMB?: number;
    acceptedFileTypes?: string[];
    disabled?: boolean;
    uploadProgress?: number;
    isUploading?: boolean;
    uploadError?: string | null;
    uploadSuccess?: boolean;
    className?: string;
    multiple?: boolean;
    onValidationError?: (error: string) => void;
}

const DEFAULT_MAX_SIZE_MB = 70;
const DEFAULT_ACCEPTED_TYPES = [
    "image/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    ".zip",
    ".rar",
    ".7z",
];

export function FileUpload({
    onFileSelect,
    onFileRemove,
    maxSizeInMB = DEFAULT_MAX_SIZE_MB,
    acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
    disabled = false,
    uploadProgress = 0,
    isUploading = false,
    uploadError = null,
    uploadSuccess = false,
    className,
    multiple = false,
    onValidationError,
}: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const validateFile = useCallback(
        (file: File): string | null => {
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                return `File size exceeds ${maxSizeInMB}MB limit`;
            }

            const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
            const mimeType = file.type;

            const isAccepted = acceptedFileTypes.some(
                (type) =>
                    type === mimeType ||
                    (type.endsWith("/*") && mimeType.startsWith(type.slice(0, -1))) ||
                    type === fileExtension
            );

            if (!isAccepted) {
                return "File type not supported";
            }

            return null;
        },
        [maxSizeInMB, acceptedFileTypes]
    );

    const handleFileSelection = useCallback(
        (file: File) => {
            const error = validateFile(file);
            if (error) {
                setFileError(error);
                if (onValidationError) {
                    onValidationError(error);
                }
                return;
            }

            setFileError(null);
            setSelectedFile(file);
            onFileSelect(file);
        },
        [onFileSelect, validateFile, onValidationError]
    );

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            if (multiple) {
                Array.from(files).forEach((file) => handleFileSelection(file));
            } else {
                const file = files[0];
                if (file) {
                    handleFileSelection(file);
                }
            }
        }
    };

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragOver(false);

            if (disabled || isUploading) return;

            const files = event.dataTransfer.files;
            if (files) {
                if (multiple) {
                    Array.from(files).forEach((file) => handleFileSelection(file));
                } else {
                    const file = files[0];
                    if (file) {
                        handleFileSelection(file);
                    }
                }
            }
        },
        [disabled, isUploading, handleFileSelection, multiple]
    );

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!disabled && !isUploading) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileError(null);
        onFileRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleChooseFile = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    const renderUploadArea = () => {
        if (selectedFile && !fileError && !multiple) {
            return (
                <Card className="w-full">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="shrink-0">
                                    {uploadSuccess ? (
                                        <CheckCircle className="h-8 w-8 text-green-500" />
                                    ) : uploadError ? (
                                        <AlertCircle className="h-8 w-8 text-red-500" />
                                    ) : (
                                        <File className="h-8 w-8 text-blue-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(selectedFile.size)}
                                    </p>
                                    {isUploading && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>{uploadProgress.toFixed(0)}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-1" />
                                        </div>
                                    )}
                                    {uploadError && (
                                        <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                                    )}
                                    {uploadSuccess && (
                                        <p className="text-xs text-green-500 mt-1">
                                            Upload completed successfully
                                        </p>
                                    )}
                                </div>
                            </div>
                            {!isUploading && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemoveFile}
                                    className="shrink-0 ml-2 cursor-pointer hover:cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                    isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && "hover:cursor-pointer",
                    className
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleChooseFile}
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="shrink-0">
                        <Upload
                            className={cn(
                                "h-12 w-12",
                                isDragOver ? "text-primary" : "text-muted-foreground"
                            )}
                        />
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg font-medium">
                            {isDragOver
                                ? multiple
                                    ? "Drop files here"
                                    : "Drop file here"
                                : multiple
                                  ? "Choose files or drag & drop"
                                  : "Choose file or drag & drop"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Maximum file size: {maxSizeInMB}MB
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Supports: Images, PDFs, Documents, Spreadsheets, Presentations, Archives
                        </p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    accept={acceptedFileTypes.join(",")}
                    className="hidden"
                    disabled={disabled}
                    multiple={multiple}
                />
            </div>
        );
    };

    return (
        <div className="w-full space-y-2">
            {renderUploadArea()}
            {fileError && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fileError}</span>
                </p>
            )}
        </div>
    );
}
