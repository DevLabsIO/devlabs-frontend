"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { FileList } from "./file-list";
import { useToast } from "@/hooks/use-toast";
import fileUploadQueries from "@/repo/file-upload-queries/file-upload-queries";
import { FileUploadParams } from "@/types/features";
import reviewQueries from "@/repo/review-queries/review-queries";
import teamQueries from "@/repo/team-queries/team-queries";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { useSessionContext } from "@/lib/session-context";
import { Upload, File as FileIcon, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectWithTeam } from "@/types/entities";
import { calculateReviewStatus } from "@/lib/utils/review-status";

interface FileUploadSectionProps {
  reviewId: string;
  projectId: string;
}

export function FileUploadSection({
  reviewId,
  projectId,
}: FileUploadSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set(),
  );
  const [fileListKey, setFileListKey] = useState(0);
  const { success, error } = useToast();
  const { user: currentUser } = useSessionContext();

  const { data: review } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: () => reviewQueries.getReviewById(reviewId),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: project } = useQuery<ProjectWithTeam>({
    queryKey: ["project", projectId],
    queryFn: () => projectQueries.fetchProjectByProjectId(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: team } = useQuery({
    queryKey: ["team", project?.teamId],
    queryFn: () => teamQueries.getTeamById(project!.teamId),
    enabled: !!project?.teamId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const reviewStatus = review
    ? calculateReviewStatus(review.startDate, review.endDate)
    : null;
  const isReviewComplete = reviewStatus === "COMPLETED";

  const userGroups = (currentUser?.groups as string[]) || [];
  const canUpload =
    currentUser &&
    !isReviewComplete &&
    (userGroups.includes("student") ||
      userGroups.includes("admin") ||
      userGroups.includes("manager"));

  const uploadMutation = useMutation({
    mutationFn: (params: FileUploadParams) =>
      fileUploadQueries.uploadFile(params, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [params.file.name]: progress,
        }));
        if (progress === 100) {
          setProcessingFiles((prev) => new Set([...prev, params.file.name]));
        }
      }),
    onSuccess: (data, variables) => {
      success(`File "${variables.file.name}" uploaded successfully!`);
      setSelectedFiles((prev) =>
        prev.filter((file) => file.name !== variables.file.name),
      );
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[variables.file.name];
        return newProgress;
      });
      setProcessingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.file.name);
        return newSet;
      });
      setFileListKey((prev) => prev + 1);
    },
    onError: (err: Error, variables) => {
      let errorMessage =
        err.message || "Failed to upload file. Please try again.";

      if (
        err.message?.includes("413") ||
        err.message?.includes("Content Too Large")
      ) {
        errorMessage = `File "${variables.file.name}" is too large for the server. Please reduce the file size and try again.`;
      } else if (err.message?.includes("400")) {
        errorMessage = `Invalid file format for "${variables.file.name}". Please check the file type and try again.`;
      } else if (err.message?.includes("401") || err.message?.includes("403")) {
        errorMessage = `You don't have permission to upload "${variables.file.name}".`;
      } else if (
        err.message?.includes("network") ||
        err.message?.includes("fetch")
      ) {
        errorMessage = `Network error while uploading "${variables.file.name}". Please check your connection and try again.`;
      } else {
        errorMessage = `Failed to upload "${variables.file.name}": ${errorMessage}`;
      }

      error(errorMessage);
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[variables.file.name];
        return newProgress;
      });
      setProcessingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.file.name);
        return newSet;
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (selectedFiles.some((f) => f.name === file.name)) {
      error(`File "${file.name}" is already selected.`);
      return;
    }

    setSelectedFiles((prev) => [...prev, file]);
  };

  const handleFileRemove = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setProcessingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
  };

  const handleUploadAll = () => {
    if (selectedFiles.length === 0) {
      error("No files selected for upload.");
      return;
    }

    if (!review || !project) {
      error(
        "Review or project information is missing. Please refresh the page and try again.",
      );
      return;
    }
    selectedFiles.forEach((file) => handleUpload(file));
  };

  const handleUpload = (file: File) => {
    if (!review || !project) {
      error(
        "Review or project information is missing. Please refresh the page and try again.",
      );
      return;
    }

    const teamId = project.teamId;
    const teamName = team?.name || "UnknownTeam";
    const projectName = project.title;
    const reviewName = review.name;

    const uploadParams: FileUploadParams = {
      file: file,
      teamId,
      teamName,
      projectId,
      projectName,
      reviewId,
      reviewName,
    };

    uploadMutation.mutate(uploadParams);
  };

  const isUploading = uploadMutation.isPending;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canUpload ? (
          <>
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={() => {}}
              maxSizeInMB={70}
              disabled={isUploading}
              uploadProgress={0}
              isUploading={false}
              uploadError={null}
              uploadSuccess={false}
              multiple={true}
              onValidationError={(errorMsg) => error(errorMsg)}
              className="cursor-pointer hover:cursor-pointer"
            />

            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  Selected Files ({selectedFiles.length})
                </h4>
                {selectedFiles.map((file) => {
                  const fileProgress = uploadProgress[file.name] || 0;
                  const isFileUploading =
                    fileProgress > 0 && fileProgress < 100;
                  const isFileProcessing = processingFiles.has(file.name);
                  const isFileComplete =
                    !isFileUploading && !isFileProcessing && fileProgress === 0;

                  return (
                    <Card key={file.name} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            {(isFileUploading || isFileProcessing) && (
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>
                                    {isFileProcessing
                                      ? "Processing..."
                                      : "Uploading..."}
                                  </span>
                                  <span>
                                    {isFileProcessing
                                      ? "100%"
                                      : `${fileProgress.toFixed(0)}%`}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                      isFileProcessing
                                        ? "bg-orange-500 animate-pulse"
                                        : "bg-blue-600"
                                    }`}
                                    style={{
                                      width: `${
                                        isFileProcessing ? 100 : fileProgress
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isFileComplete && (
                            <>
                              <Button
                                onClick={() => handleUpload(file)}
                                size="sm"
                                className="gap-1 cursor-pointer hover:cursor-pointer"
                              >
                                <Upload className="h-3 w-3" />
                                Upload
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFileRemove(file.name)}
                                className="cursor-pointer hover:cursor-pointer"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}

                <div className="flex justify-end">
                  <Button
                    onClick={handleUploadAll}
                    disabled={
                      isUploading ||
                      selectedFiles.length === 0 ||
                      processingFiles.size > 0
                    }
                    className="gap-2 cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    Upload All Files ({selectedFiles.length})
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : isReviewComplete ? (
          <Alert>
            <AlertDescription>
              Files cannot be uploaded for this review as it is already
              completed.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertDescription>
              You do not have permission to upload files for this review.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-6">
          <FileList
            key={fileListKey}
            projectId={projectId}
            projectName={project?.title}
            reviewId={reviewId}
            reviewName={review?.name}
            teamId={project?.teamId}
            teamName={team?.name || "Unknown"}
            onFileDeleted={() => setFileListKey((prev) => prev + 1)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
