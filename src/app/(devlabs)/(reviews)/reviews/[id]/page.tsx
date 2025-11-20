"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useReview } from "@/components/reviews/hooks/use-review";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Info } from "lucide-react";
import { useSessionContext } from "@/lib/session-context";
import { calculateReviewStatus } from "@/lib/utils/review-status";
import type { ReviewProjectsResponse } from "@/types/api";
import { ReviewHeader } from "@/components/reviews/review-detail/review-header";
import { ReviewProjectsTab } from "@/components/reviews/review-detail/review-projects-tab";
import { ReviewDetailsTab } from "@/components/reviews/review-detail/review-details-tab";
import { ReviewDetailSkeleton } from "@/components/reviews/review-detail/review-detail-skeleton";
import { ReviewErrorState } from "@/components/reviews/review-detail/review-error-state";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;
  const { session } = useSessionContext();

  const {
    data: review,
    isLoading: reviewLoading,
    error: reviewError,
  } = useReview(reviewId);

  const {
    data: reviewProjects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery<ReviewProjectsResponse>({
    queryKey: ["reviewProjects", reviewId],
    queryFn: () => reviewQueries.getReviewProjects(reviewId),
    enabled: !!reviewId,
  });

  const reviewStatus = useMemo(() => {
    if (!review) return null;
    return calculateReviewStatus(review.startDate, review.endDate);
  }, [review]);

  const canPublish = useMemo(() => {
    if (!session?.user || !review || !reviewStatus) return false;
    if (reviewStatus !== "COMPLETED") return false;
    const userGroups = (session.user.groups ?? []) as string[];
    const ALLOWED_PUBLISH_GROUPS = ["admin", "manager", "faculty"] as const;
    return ALLOWED_PUBLISH_GROUPS.some((g) => userGroups.includes(g));
  }, [session?.user, review, reviewStatus]);

  if (reviewLoading || projectsLoading) {
    return <ReviewDetailSkeleton />;
  }

  if (reviewError || !review || projectsError || !reviewProjects) {
    return (
      <ReviewErrorState error={reviewError} onBack={() => router.back()} />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ReviewHeader
        review={review}
        projectCount={reviewProjects.projects.length}
        reviewStatus={reviewStatus}
        canPublish={canPublish}
        onBack={() => router.back()}
      />

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ReviewProjectsTab
            reviewId={reviewId}
            reviewProjects={reviewProjects}
          />
        </TabsContent>

        <TabsContent value="details">
          <ReviewDetailsTab review={review} reviewStatus={reviewStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
