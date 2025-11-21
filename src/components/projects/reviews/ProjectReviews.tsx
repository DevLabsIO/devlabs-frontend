"use client";

import { useQuery } from "@tanstack/react-query";
import { evaluationQueries } from "@/repo/evaluation-queries/evaluation-queries";
import ReviewCard from "./ReviewCard";
import { ProjectReviewsResponse } from "@/types/features";
import { useState, Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectReviewsProps {
  projectId: string;
  projectCourses: { id: string; name: string; code?: string }[];
}

function ReviewsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-80" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 p-6 border rounded-lg">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectReviews({
  projectId,
  projectCourses,
}: ProjectReviewsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: reviewsResponse,
    isLoading,
    error,
  } = useQuery<ProjectReviewsResponse>({
    queryKey: ["projectReviews", projectId],
    queryFn: () => evaluationQueries.fetchReviewsForProject(projectId),
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return <ReviewsLoadingSkeleton />;
  }

  if (error) return <div>Error loading reviews.</div>;

  if (!reviewsResponse || !reviewsResponse.hasReview) {
    return <p>No reviews found for this project.</p>;
  }

  const allReviews = [
    ...reviewsResponse.liveReviews.map((r) => ({
      ...r,
      status: "LIVE" as const,
    })),
    ...reviewsResponse.upcomingReviews.map((r) => ({
      ...r,
      status: "SCHEDULED" as const,
    })),
    ...reviewsResponse.completedReviews.map((r) => ({
      ...r,
      status: "COMPLETED" as const,
    })),
  ];

  const filteredReviews = allReviews.filter((review) =>
    review.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Suspense fallback={<ReviewsLoadingSkeleton />}>
      <div className="space-y-6">
        <Input
          type="text"
          placeholder="Search reviews by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                projectId={projectId}
                projectCourses={projectCourses}
              />
            ))
          ) : (
            <p className="text-muted-foreground col-span-full">
              No reviews match your search.
            </p>
          )}
        </div>
      </div>
    </Suspense>
  );
}
