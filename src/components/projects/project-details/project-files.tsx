"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, ExternalLink, Download, Plus, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getFileName, getFileExtension, getFileIcon } from "./status-config";

interface ProjectFilesProps {
    files: string[];
    canEdit?: boolean;
    isLoading: boolean;
    onAddClick: () => void;
    onDeleteClick: (filePath: string) => void;
    onOpenFile: (objectName: string) => void;
    onDownloadFile: (objectName: string) => void;
}

export function ProjectFiles({
    files,
    canEdit,
    isLoading,
    onAddClick,
    onDeleteClick,
    onOpenFile,
    onDownloadFile,
}: ProjectFilesProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        Project Files
                        {files.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {files.length}
                            </Badge>
                        )}
                    </CardTitle>
                    {canEdit && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onAddClick}
                            className="shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Upload
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {files.length > 0 ? (
                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                        {files.map((filePath, index) => (
                            <div
                                key={index}
                                className="group flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`shrink-0 ${getFileIcon(filePath)}`}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                            {getFileName(filePath)}
                                        </p>
                                        <p className="text-xs text-muted-foreground uppercase">
                                            {getFileExtension(filePath)} file
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onOpenFile(filePath)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Open in new tab</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onDownloadFile(filePath)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Download file</TooltipContent>
                                    </Tooltip>
                                    {canEdit && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDeleteClick(filePath)}
                                                    disabled={isLoading}
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Remove file</TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No files uploaded yet</p>
                        {canEdit && (
                            <Button variant="link" size="sm" onClick={onAddClick} className="mt-1">
                                Upload your first file
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
