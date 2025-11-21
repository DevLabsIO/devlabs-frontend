import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import fileUploadQueries from "@/repo/file-upload-queries/file-upload-queries";
import { FileListParams } from "@/types/features";
import { Download, File, Trash2, ExternalLink } from "lucide-react";

interface FileListProps {
  projectId?: string;
  projectName?: string;
  reviewId?: string;
  reviewName?: string;
  teamId?: string;
  teamName?: string;
  onFileDeleted?: () => void;
}

export function FileList({
  projectId,
  projectName,
  reviewId,
  reviewName,
  teamId,
  teamName,
  onFileDeleted,
}: FileListProps) {
  const { success, error: showError } = useToast();
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const queryParams: FileListParams = useMemo(
    () => ({
      projectId,
      projectName,
      reviewId,
      reviewName,
      teamId,
      teamName,
    }),
    [projectId, projectName, reviewId, reviewName, teamId, teamName],
  );

  const {
    data: fileList,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["fileList", queryParams],
    queryFn: () => fileUploadQueries.listFiles(queryParams),
    enabled: !!(projectId || reviewId || teamId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleDownloadAll = async () => {
    if (!fileList?.files || fileList.files.length === 0) {
      showError("No files available to download.");
      return;
    }

    try {
      success(`Starting download of ${fileList.files.length} file(s)...`);

      for (const file of fileList.files) {
        await handleDownload(file.objectName, getActualFileName(file.fileName));

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      success("All files downloaded successfully!");
    } catch (error) {
      console.error("Download all error:", error);
      showError("Failed to download some files. Please try again.");
    }
  };

  const handleDownload = async (objectName: string, fileName: string) => {
    try {
      const { downloadUrl } =
        await fileUploadQueries.getDownloadUrl(objectName);

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      showError("Failed to download the file. Please try again.");
    }
  };

  const handleOpen = async (objectName: string) => {
    try {
      const { downloadUrl } =
        await fileUploadQueries.getDownloadUrl(objectName);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Open error:", error);
      showError("Failed to open the file. Please try again.");
    }
  };

  const getActualFileName = (fileName: string) => {
    const parts = fileName.split("_");
    if (parts.length > 1) {
      return parts.slice(1).join("_");
    }
    return fileName;
  };

  const handleDelete = async (objectName: string, fileName: string) => {
    setDeletingFiles((prev) => new Set(prev).add(objectName));

    try {
      await fileUploadQueries.deleteFile(objectName);
      success(`"${fileName}" has been deleted successfully.`);
      refetch();
      onFileDeleted?.();
    } catch {
      showError("Failed to delete the file. Please try again.");
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(objectName);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (queryError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Failed to load files. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const files = fileList?.files || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Uploaded Files
            <Badge variant="secondary" className="ml-2">
              {files.length}
            </Badge>
          </CardTitle>
          {files.length > 0 && (
            <Button
              onClick={handleDownloadAll}
              variant="outline"
              size="sm"
              className="gap-2 cursor-pointer hover:cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download All ({files.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No files uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.objectName}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <File className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-medium truncate"
                      title={getActualFileName(file.fileName)}
                    >
                      {getActualFileName(file.fileName)}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>
                        {new Date(file.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpen(file.objectName)}
                    className="h-8 cursor-pointer hover:cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownload(
                        file.objectName,
                        getActualFileName(file.fileName),
                      )
                    }
                    className="h-8 cursor-pointer hover:cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={deletingFiles.has(file.objectName)}
                        className="h-8 text-destructive hover:text-destructive cursor-pointer hover:cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;
                          {getActualFileName(file.fileName)}&quot;? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer hover:cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDelete(
                              file.objectName,
                              getActualFileName(file.fileName),
                            )
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer hover:cursor-pointer"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
