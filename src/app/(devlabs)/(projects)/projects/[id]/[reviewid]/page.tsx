"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { FileUploadSection } from "@/components/file-upload/file-upload-section";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { calculateReviewStatus, getStatusColor, formatStatus } from "@/lib/utils/review-status";

export default function ProjectReviewPage() {
    const params = useParams();
    const reviewId = params.reviewid as string;
    const projectId = params.id as string;

    const {
        data: review,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["review", reviewId],
        queryFn: () => reviewQueries.getUserBasedReviews(reviewId),
        enabled: !!reviewId,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-9 w-80" />
                    <div className="flex items-center gap-4 flex-wrap">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 bg-muted/5">
                        <div className="text-center space-y-4">
                            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                            <Skeleton className="h-5 w-64 mx-auto" />
                            <Skeleton className="h-4 w-48 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Review</h1>
                <p className="text-gray-600">
                    There was an error loading the review. Please try again later.
                </p>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Review Not Found</h1>
                <p className="text-gray-600">The review you are looking for does not exist.</p>
            </div>
        );
    }

    const reviewStatus = calculateReviewStatus(review.startDate, review.endDate);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">{review.name}</h1>
                <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="outline" className={getStatusColor(reviewStatus)}>
                        {formatStatus(reviewStatus)}
                    </Badge>
                    {review.isPublished && (
                        <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Published
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Review Schedule
                        </h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Start Date:</span>
                            <span>{format(new Date(review.startDate), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">End Date:</span>
                            <span>{format(new Date(review.endDate), "PPP")}</span>
                        </div>
                    </div>
                </div>
            </div>

            <FileUploadSection reviewId={reviewId} projectId={projectId} />
        </div>
    );
}
