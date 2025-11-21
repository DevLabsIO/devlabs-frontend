"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, DownloadIcon } from "lucide-react";
import { PublishReviewButton } from "@/components/reviews/publish-review-button";
import type { Review } from "@/types/entities";

interface ReviewHeaderProps {
  review: Review;
  projectCount: number;
  reviewStatus: string | null;
  canPublish: boolean;
  onBack: () => void;
  onExportClick: () => void;
}

export function ReviewHeader({
  review,
  projectCount,
  reviewStatus,
  canPublish,
  onBack,
  onExportClick,
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
        <Button
          onClick={onExportClick}
          variant="outline"
          size="default"
          className="gap-2"
        >
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
