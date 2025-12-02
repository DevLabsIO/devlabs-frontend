"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, Plus, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

interface ProjectReference {
    id?: string;
    title: string;
    url?: string | null;
    description?: string | null;
}

interface ProjectReferencesProps {
    references: ProjectReference[];
    canEdit?: boolean;
    isLoading: boolean;
    onAddClick: () => void;
    onDeleteClick: (index: number) => void;
}

export function ProjectReferences({
    references,
    canEdit,
    isLoading,
    onAddClick,
    onDeleteClick,
}: ProjectReferencesProps) {
    return (
        <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-primary" />
                        References
                        {references.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {references.length}
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
                            Add
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                {references.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {references.map((ref, index) => (
                            <div
                                key={ref.id || index}
                                className="group flex items-start gap-4 p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                            >
                                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium text-foreground">{ref.title}</h4>
                                        <div className="flex items-center gap-1 shrink-0">
                                            {ref.url && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={ref.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-md hover:bg-background transition-colors"
                                                        >
                                                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Open link</TooltipContent>
                                                </Tooltip>
                                            )}
                                            {canEdit && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => onDeleteClick(index)}
                                                            disabled={isLoading}
                                                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Remove reference
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                    {ref.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {ref.description}
                                        </p>
                                    )}
                                    {ref.url && (
                                        <p className="text-xs text-primary/70 truncate">
                                            {ref.url}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No references added yet</p>
                        {canEdit && (
                            <Button variant="link" size="sm" onClick={onAddClick} className="mt-1">
                                Add your first reference
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
