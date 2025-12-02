"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon, Pencil, Trash2 } from "lucide-react";
import { PublishReviewButton } from "@/components/reviews/publish-review-button";
import type { Review } from "@/types/entities";

interface ReviewHeaderProps {
    review: Review;
    projectCount: number;
    reviewStatus: string | null;
    canPublish: boolean;
    canEdit: boolean;
    onBack: () => void;
    onExportClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
}

export function ReviewHeader({
    review,
    projectCount,
    reviewStatus,
    canPublish,
    canEdit,
    onBack,
    onExportClick,
    onEditClick,
    onDeleteClick,
}: ReviewHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{review.name}</h1>
                    <p className="text-muted-foreground">
                        {projectCount} Project{projectCount !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {canEdit && (
                    <>
                        <Button
                            onClick={onEditClick}
                            variant="outline"
                            size="default"
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            onClick={onDeleteClick}
                            variant="outline"
                            size="default"
                            className="gap-2 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </>
                )}
                <Button onClick={onExportClick} variant="outline" size="default" className="gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export Results
                </Button>
                {canPublish ? (
                    <PublishReviewButton
                        reviewId={review.id}
                        isPublished={review.isPublished}
                        canPublish={canPublish}
                        variant="default"
                        size="default"
                    />
                ) : reviewStatus !== "COMPLETED" ? (
                    <Button disabled variant="outline" size="default">
                        Publish (Available after completion)
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
