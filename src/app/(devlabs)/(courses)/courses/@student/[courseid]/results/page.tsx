"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { useParams, useRouter } from "next/navigation";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, BarChart3, Download, Folder } from "lucide-react";
import { ReviewPerformance } from "@/components/student-courses/performance-overview-chart";
import { Course, Project } from "@/types/entities";
import PerformanceAnalytics from "@/components/student-courses/course-results/PerformanceAnalytics";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProjectCard } from "@/components/projects/project-card";

const getScoreCategory = (score: number) => {
    if (score < 50) return "Poor";
    if (score >= 50 && score < 70) return "Average";
    if (score >= 70 && score < 85) return "Good";
    return "Excellent";
};

const categoryColors: Record<string, string> = {
    Excellent: "hsl(var(--chart-2))",
    Good: "hsl(var(--chart-1))",
    Average: "hsl(var(--chart-3))",
    Poor: "hsl(var(--chart-4))",
};

const CoursePerformancePage = () => {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseid as string;
    const { session, status } = useSessionContext();
    const studentId = session?.user?.id;

    const {
        data: courseData,
        isLoading: courseLoading,
        isError: courseError,
    } = useQuery<Course>({
        queryKey: ["course", courseId],
        queryFn: () => courseQueries.getCourseById(courseId),
        enabled: !!courseId,
    });

    const {
        data: performanceData,
        isLoading: performanceLoading,
        isError: performanceError,
    } = useQuery<ReviewPerformance[]>({
        queryKey: ["coursePerformance", studentId, courseId],
        queryFn: () => courseQueries.getCoursePerformance(studentId!, courseId),
        enabled: !!studentId && !!courseId,
    });

    const {
        data: projectsData,
        isLoading: projectsLoading,
        isError: projectsError,
    } = useQuery<Project[]>({
        queryKey: ["courseProjects", studentId, courseId],
        queryFn: () => projectQueries.fetchProjectsByCourseId(courseId),
        enabled: !!courseId,
    });

    if (status === "unauthenticated") {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>Please sign in to view your course performance.</AlertDescription>
            </Alert>
        );
    }

    if (courseError || performanceError || projectsError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load course performance data. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    const isLoading = courseLoading || performanceLoading || projectsLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-12 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Skeleton className="aspect-square max-h-[300px]" />
                            <Skeleton className="h-[300px]" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const completedReviews = performanceData?.filter((q) => q.status === "completed") || [];

    const reviewStats = {
        total: performanceData?.length || 0,
        completed: completedReviews.length,
        upcoming: performanceData?.filter((q) => q.status === "upcoming").length || 0,
        live: performanceData?.filter((q) => q.status === "ongoing").length || 0,
    };

    const totalScore = completedReviews.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const maxScore = completedReviews.reduce((acc, curr) => acc + (curr.totalScore || 0), 0);
    const normalizedAverageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const scoreDistribution = completedReviews.reduce((acc: Record<string, number>, curr) => {
        const category = getScoreCategory(curr.scorePercentage || 0);
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    const pieChartData = Object.entries(scoreDistribution).map(([category, count]) => ({
        category,
        count,
        fill: categoryColors[category],
    }));

    const barChartData = completedReviews.map((review) => ({
        reviewName: review.reviewName,
        score: review.scorePercentage || 0,
    }));

    const projectsByStatus = {
        PROPOSED: projectsData?.filter((p) => p.status === "PROPOSED") || [],
        ONGOING: projectsData?.filter((p) => p.status === "ONGOING") || [],
        COMPLETED: projectsData?.filter((p) => p.status === "COMPLETED") || [],
        REJECTED: projectsData?.filter((p) => p.status === "REJECTED") || [],
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    className="border-2 hover:bg-accent"
                    onClick={() => router.push("/courses")}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Courses
                </Button>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{courseData?.name}</h1>
                    <p className="text-muted-foreground">{courseData?.code}</p>
                </div>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                        const csvContent = [
                            ["Course Name", courseData?.name],
                            ["Course Code", courseData?.code],
                        ]
                            .map((row) => row.join(","))
                            .join("\n");
                        const blob = new Blob([csvContent], {
                            type: "text/csv;charset=utf-8;",
                        });
                        const link = document.createElement("a");
                        const url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", `${courseData?.code}_performance.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}
                >
                    <Download className="h-4 w-4" />
                    Export Data
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Review Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Total Reviews</p>
                            <span className="font-bold text-lg">{reviewStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Completed</p>
                            <span className="font-bold text-lg">{reviewStats.completed}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Upcoming</p>
                            <span className="font-bold text-lg text-yellow-500">
                                {reviewStats.upcoming}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Live</p>
                            <span className="font-bold text-lg text-green-500">
                                {reviewStats.live}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Average Score</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                        <div
                                            className="bg-primary h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${normalizedAverageScore}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-lg">
                                        {normalizedAverageScore.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Score</p>
                                <p className="text-lg font-bold">
                                    {totalScore.toFixed(1)} / {maxScore.toFixed(1)} points
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <CardTitle>Performance Analytics</CardTitle>
                    </div>
                    <CardDescription>Detailed breakdown of your review performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <PerformanceAnalytics pieChartData={pieChartData} barChartData={barChartData} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-primary" />
                        <CardTitle>Course Projects</CardTitle>
                    </div>
                    <CardDescription>Projects associated with this course</CardDescription>
                </CardHeader>
                <CardContent>
                    {projectsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border rounded-lg p-4">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : projectsData && projectsData.length > 0 ? (
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-6">
                                <TabsTrigger value="all">All ({projectsData.length})</TabsTrigger>
                                <TabsTrigger value="PROPOSED">
                                    Proposed ({projectsByStatus.PROPOSED.length})
                                </TabsTrigger>
                                <TabsTrigger value="ONGOING">
                                    Live ({projectsByStatus.ONGOING.length})
                                </TabsTrigger>
                                <TabsTrigger value="COMPLETED">
                                    Completed ({projectsByStatus.COMPLETED.length})
                                </TabsTrigger>
                                <TabsTrigger value="REJECTED">
                                    Rejected ({projectsByStatus.REJECTED.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="space-y-4">
                                <div className="grid gap-4">
                                    {projectsData.map((project) => (
                                        <ProjectCard key={project.id} project={project} />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="PROPOSED" className="space-y-4">
                                <div className="grid gap-4">
                                    {projectsByStatus.PROPOSED.length > 0 ? (
                                        projectsByStatus.PROPOSED.map((project) => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No proposed projects found
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="ONGOING" className="space-y-4">
                                <div className="grid gap-4">
                                    {projectsByStatus.ONGOING.length > 0 ? (
                                        projectsByStatus.ONGOING.map((project) => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No live projects found
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="COMPLETED" className="space-y-4">
                                <div className="grid gap-4">
                                    {projectsByStatus.COMPLETED.length > 0 ? (
                                        projectsByStatus.COMPLETED.map((project) => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No completed projects found
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="REJECTED" className="space-y-4">
                                <div className="grid gap-4">
                                    {projectsByStatus.REJECTED.length > 0 ? (
                                        projectsByStatus.REJECTED.map((project) => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No rejected projects found
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No projects found for this course
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CoursePerformancePage;
