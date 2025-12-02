"use client";

import { useQuery } from "@tanstack/react-query";
import { evaluationQueries } from "@/repo/evaluation-queries/evaluation-queries";
import { ProjectReviewsResponse } from "@/types/features";
import { Review } from "@/types/entities";
import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, SearchX } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useSessionContext } from "@/lib/session-context";
import { useToast } from "@/hooks/use-toast";
import { GridItem, GridItemSkeleton } from "@/components/data-grid/grid-item";
import type { GridItemFieldConfig, GridItemAction } from "@/types/ui";

interface ProjectReviewsProps {
    projectId: string;
    projectCourses: { id: string; name: string; code?: string }[];
}

type ReviewWithStatus = Review & {
    status: "LIVE" | "SCHEDULED" | "COMPLETED";
    [key: string]: unknown;
};

function ReviewsLoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-10 w-80 bg-muted rounded animate-pulse" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <GridItemSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export default function ProjectReviews({ projectId, projectCourses }: ProjectReviewsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { user } = useSessionContext();
    const { error: showError } = useToast();
    const router = useRouter();

    const canEvaluate = !!(
        user &&
        user.groups &&
        ((user.groups as string[]).includes("admin") ||
            (user.groups as string[]).includes("faculty") ||
            (user.groups as string[]).includes("manager"))
    );

    const isStudent = !!(user && user.groups && (user.groups as string[]).includes("student"));

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

    const allReviews = useMemo(() => {
        if (!reviewsResponse || !reviewsResponse.hasReview) return [];
        return [
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
    }, [reviewsResponse]);

    const filteredReviews = useMemo(() => {
        return allReviews.filter((review) =>
            review.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allReviews, searchTerm]);

    const fieldConfig: GridItemFieldConfig<ReviewWithStatus> = useMemo(
        () => ({
            id: "id",
            title: "name",
        }),
        []
    );

    const getStatusBadgeClassName = (status: Review["status"]) => {
        switch (status) {
            case "LIVE":
                return "bg-green-500 hover:bg-green-600 text-white border-green-500";
            case "SCHEDULED":
                return "bg-blue-500 hover:bg-blue-600 text-white border-blue-500";
            case "COMPLETED":
                return "bg-purple-500 hover:bg-purple-600 text-white border-purple-500";
            case "CANCELLED":
                return "bg-red-500 hover:bg-red-600 text-white border-red-500";
            default:
                return "bg-gray-500 hover:bg-gray-600 text-white border-gray-500";
        }
    };

    const getActionsForReview = useCallback(
        (review: ReviewWithStatus): GridItemAction<ReviewWithStatus>[] => {
            const actions: GridItemAction<ReviewWithStatus>[] = [];

            if (review.status === "LIVE" && canEvaluate) {
                actions.push({
                    label: "Evaluate",
                    onClick: (_, e) => {
                        e.stopPropagation();
                        router.push(`/evaluate/${projectId}/${review.id}`);
                    },
                });
            }

            if (review.status === "COMPLETED" && (canEvaluate || isStudent)) {
                actions.push({
                    label: "View Results",
                    variant: "outline",
                    onClick: (r, e) => {
                        e.stopPropagation();
                        if (canEvaluate) {
                            router.push(`/results/${r.id}/${projectId}`);
                        } else if (isStudent) {
                            if (r.isPublished) {
                                router.push(`/results/${r.id}/${projectId}`);
                            } else {
                                showError("Results not yet published");
                            }
                        }
                    },
                    disabled: isStudent && !review.isPublished,
                });
            }

            actions.push({
                label: "View Review",
                variant: "outline",
                onClick: (r, e) => {
                    e.stopPropagation();
                    if (r.status === "LIVE" || r.status === "COMPLETED") {
                        router.push(`/projects/${projectId}/${r.id}`);
                    } else if (r.status === "SCHEDULED") {
                        if (isStudent || canEvaluate) {
                            router.push(`/projects/${projectId}/${r.id}`);
                        } else {
                            showError("Review is yet to start");
                        }
                    }
                },
            });

            return actions;
        },
        [canEvaluate, isStudent, projectId, router, showError]
    );

    const renderCustomBadge = useCallback(
        (review: ReviewWithStatus) => (
            <Badge className={getStatusBadgeClassName(review.status)}>{review.status}</Badge>
        ),
        []
    );

    const renderCustomContent = useCallback(
        (review: ReviewWithStatus) => {
            const relevantCourses = review.courses.filter((course) =>
                projectCourses.some((pc) => pc.id === course.id)
            );

            return (
                <div className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground gap-2 p-2 rounded-lg bg-muted/50">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="font-medium">
                            {format(new Date(review.startDate), "MMM d, yyyy")} -{" "}
                            {format(new Date(review.endDate), "MMM d, yyyy")}
                        </span>
                    </div>
                    <div className="flex items-center text-sm gap-2 p-2 rounded-lg bg-muted/50 min-w-0">
                        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground text-xs shrink-0">Rubric</span>
                        <span className="font-medium truncate" title={review.rubricsInfo.name}>
                            {review.rubricsInfo.name}
                        </span>
                    </div>
                    {relevantCourses.length > 0 && (
                        <div className="pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Relevant Courses</p>
                            <div className="flex flex-wrap gap-1">
                                {relevantCourses.slice(0, 3).map((course) => (
                                    <Badge
                                        key={course.id}
                                        variant="secondary"
                                        className="text-xs max-w-32 truncate"
                                        title={course.name}
                                    >
                                        {course.name}
                                    </Badge>
                                ))}
                                {relevantCourses.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{relevantCourses.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        },
        [projectCourses]
    );

    if (isLoading) {
        return <ReviewsLoadingSkeleton />;
    }

    if (error) return <div>Error loading reviews.</div>;

    if (!reviewsResponse || !reviewsResponse.hasReview) {
        return <p>No reviews found for this project.</p>;
    }

    return (
        <div className="space-y-6">
            <Input
                type="text"
                placeholder="Search reviews by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            {filteredReviews.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {filteredReviews.map((review, index) => (
                        <div
                            key={review.id}
                            className="animate-in fade-in-0 zoom-in-95 duration-300"
                            style={{
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: "backwards",
                            }}
                        >
                            <GridItem<ReviewWithStatus>
                                item={review}
                                isSelected={false}
                                onToggleSelect={() => {}}
                                enableSelection={false}
                                fieldConfig={fieldConfig}
                                actions={getActionsForReview(review)}
                                customBadge={renderCustomBadge}
                                customContent={renderCustomContent}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-2xl opacity-50" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-muted/50 border border-border/50 mb-6">
                            <SearchX className="h-10 w-10 text-muted-foreground/70" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No results found</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm">
                        No reviews match your search.
                    </p>
                </div>
            )}
        </div>
    );
}
