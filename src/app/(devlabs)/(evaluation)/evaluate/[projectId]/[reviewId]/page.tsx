"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { individualScoreQueries } from "@/repo/individual-score-queries/individual-score-queries";
import reviewQueries from "@/repo/review-queries/review-queries";
import teamQueries from "@/repo/team-queries/team-queries";
import { CourseEvaluationForm } from "@/components/evaluations/CourseEvaluationForm";
import { FileList } from "@/components/file-upload/file-list";
import { useSessionContext } from "@/lib/session-context";
import { ProjectWithTeam } from "@/types/entities";
import { CourseEvaluationSummary } from "@/types/features";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    BookOpen,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    Users,
    BarChart3,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

function CourseSelector({
    summary,
    project,
    reviewId,
}: {
    summary: CourseEvaluationSummary;
    project: ProjectWithTeam;
    reviewId: string;
}) {
    const { user } = useSessionContext();

    const canEvaluateCourse = (course: { instructors: { id: string }[] }) => {
        if (!user) return false;
        const userGroups = user.groups || [];
        if (
            (userGroups as string[]).includes("admin") ||
            (userGroups as string[]).includes("manager")
        )
            return true;
        if ((userGroups as string[]).includes("faculty")) {
            return course.instructors.some((instructor) => instructor.id === user.id);
        }
        return false;
    };

    const completedCount = summary.courseEvaluations.filter((c) => c.hasEvaluation).length;
    const totalCount = summary.courseEvaluations.length;
    const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="space-y-6">
            <Card className="border-2">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                <GraduationCap className="h-6 w-6 text-primary" />
                                Evaluation Progress
                            </CardTitle>
                            <CardDescription className="text-base">
                                {project.title} • {summary.reviewName}
                            </CardDescription>
                        </div>
                        <Badge
                            variant={completionPercentage === 100 ? "default" : "secondary"}
                            className="text-sm px-3 py-1"
                        >
                            {completedCount} of {totalCount} Completed
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Overall Progress</span>
                            <span className="text-primary">
                                {Math.round(completionPercentage)}%
                            </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-500 rounded-full"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {summary.courseEvaluations.map((course) => {
                    const canEvaluate = canEvaluateCourse(course);
                    return (
                        <Card
                            key={course.courseId}
                            className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`rounded-lg p-2.5 ${
                                            course.hasEvaluation
                                                ? "bg-primary/10 text-primary"
                                                : "bg-secondary text-muted-foreground"
                                        }`}
                                    >
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <CardTitle className="text-lg leading-tight">
                                            {course.courseName}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-1.5 text-sm">
                                            <Users className="h-3.5 w-3.5" />
                                            {course.instructors.map((i) => i.name).join(", ")}
                                        </CardDescription>
                                    </div>
                                    {course.hasEvaluation && (
                                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {course.hasEvaluation ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium text-primary">
                                                    Evaluation Complete
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    Pending Evaluation
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <Button
                                        asChild={canEvaluate}
                                        disabled={!canEvaluate}
                                        size="sm"
                                        variant={course.hasEvaluation ? "outline" : "default"}
                                        className="font-medium"
                                    >
                                        {canEvaluate ? (
                                            <Link
                                                href={`/evaluate/${project.id}/${reviewId}?courseId=${course.courseId}`}
                                            >
                                                {course.hasEvaluation ? "Edit" : "Start Evaluation"}
                                            </Link>
                                        ) : (
                                            <span>
                                                {course.hasEvaluation ? "View" : "Not Available"}
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default function EvaluationPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const projectId = params.projectId as string;
    const reviewId = params.reviewId as string;
    const courseId = searchParams.get("courseId");

    const { user } = useSessionContext();

    const { data: project, isLoading: isLoadingProject } = useQuery<ProjectWithTeam>({
        queryKey: ["project", projectId],
        queryFn: () => projectQueries.fetchProjectByProjectId(projectId),
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const { data: review } = useQuery({
        queryKey: ["review", reviewId],
        queryFn: () => reviewQueries.getReviewById(reviewId),
        enabled: !!reviewId,
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

    const { data: summary, isLoading: isLoadingSummary } = useQuery({
        queryKey: ["evaluationSummary", reviewId, projectId],
        queryFn: () => individualScoreQueries.fetchEvaluationSummary(reviewId, projectId),
        enabled: !courseId && !!reviewId && !!projectId && !!user,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const { data: evaluationData, isLoading: isLoadingEvaluationData } = useQuery({
        queryKey: ["courseEvaluationData", reviewId, projectId, courseId],
        queryFn: () =>
            individualScoreQueries.fetchCourseEvaluationData(reviewId, projectId, courseId!),
        enabled: !!courseId && !!reviewId && !!projectId && !!user,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    if (isLoadingProject || isLoadingSummary || isLoadingEvaluationData) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-96" />
                        </div>
                    </div>
                    <Separator />
                    <Card className="border-2">
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, i) => (
                                    <Card key={i} className="border">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-5 w-40" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Skeleton className="h-9 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <div className="container mx-auto p-6 max-w-7xl">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="rounded-xl p-3 bg-linear-to-br from-primary/20 to-primary/10 
                           border-2 border-primary/20"
                            >
                                <FileText className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Project Evaluation
                                </h1>
                                <p className="text-muted-foreground text-base mt-1">
                                    Evaluate team members based on defined criteria and performance
                                    metrics
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {project && (
                        <Card className="border-2 overflow-hidden">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    <CardTitle className="text-lg">Project Resources</CardTitle>
                                </div>
                                <CardDescription>
                                    Review submitted files and documentation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <FileList
                                    projectId={projectId}
                                    projectName={project.title}
                                    reviewId={reviewId}
                                    reviewName={review?.name}
                                    teamId={project.teamId}
                                    teamName={team?.name}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {!courseId && project && summary ? (
                        <CourseSelector summary={summary} project={project} reviewId={reviewId} />
                    ) : courseId && evaluationData && review ? (
                        <div className="space-y-6">
                            <CourseEvaluationForm
                                evaluationData={evaluationData}
                                reviewData={review}
                                projectId={projectId}
                                reviewId={reviewId}
                            />
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
