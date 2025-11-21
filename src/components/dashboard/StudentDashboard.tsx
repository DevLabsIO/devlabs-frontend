"use client";

import { useEffect, useState } from "react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import { StudentDashboardData } from "@/types/features";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  FolderOpen,
  TrendingUp,
  Eye,
  BookOpen,
  Target,
  Award,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardQueries.getStudentDashboard();
        setData(dashboardData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="absolute inset-0 h-12 w-12 animate-ping opacity-20 rounded-full bg-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="rounded-full bg-destructive/10 p-6">
          <Activity className="h-12 w-12 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">
            {error || "Failed to load dashboard"}
          </p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const completionRate =
    data.totalReviews > 0
      ? ((data.completedReviews / data.totalReviews) * 100).toFixed(1)
      : "0";
  const projectCompletionRate =
    data.totalProjects > 0
      ? ((data.completedProjects / data.totalProjects) * 100).toFixed(1)
      : "0";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative px-8 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-medium"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Student Portal
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome back!
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Track your progress, manage reviews, and stay on top of your
                academic journey.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full shadow-lg">
                <Link href="/reviews">
                  <Eye className="h-4 w-4 mr-2" />
                  Active Reviews
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Courses
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <CardContent className="relative pt-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-blue-500/10 p-3 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold">{data.activeReviews}</p>
              <p className="text-sm font-medium text-muted-foreground">
                Active Reviews
              </p>
              <p className="text-xs text-muted-foreground">
                {data.completedReviews}/{data.totalReviews} completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
          <CardContent className="relative pt-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-green-500/10 p-3 group-hover:scale-110 transition-transform">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary" className="text-xs">
                In Progress
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold">{data.activeProjects}</p>
              <p className="text-sm font-medium text-muted-foreground">
                Active Projects
              </p>
              <p className="text-xs text-muted-foreground">
                {data.completedProjects}/{data.totalProjects} completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <CardContent className="relative pt-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-purple-500/10 p-3 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  parseFloat(completionRate) >= 80 &&
                    "bg-green-100 text-green-700",
                )}
              >
                {parseFloat(completionRate) >= 80 ? "Excellent" : "On Track"}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold">{completionRate}%</p>
              <p className="text-sm font-medium text-muted-foreground">
                Review Completion
              </p>
              <p className="text-xs text-muted-foreground">
                {data.completedReviews} reviews done
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
          <CardContent className="relative pt-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl bg-orange-500/10 p-3 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Performance
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-bold">
                {data.averageProjectScore > 0
                  ? `${data.averageProjectScore.toFixed(1)}%`
                  : "N/A"}
              </p>
              <p className="text-sm font-medium text-muted-foreground">
                Average Score
              </p>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-2">
        {}
        <Card className="border-2 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-background dark:from-blue-950/20 dark:to-background px-6 py-5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Upcoming Reviews</h2>
                  <p className="text-sm text-muted-foreground">
                    {data.upcomingReviews.length} scheduled
                  </p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            {data.upcomingReviews.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="rounded-full bg-muted/50 p-6 w-fit mx-auto">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No upcoming reviews</p>
                <p className="text-sm text-muted-foreground">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.upcomingReviews.map((review) => (
                  <div
                    key={review.id}
                    className="group relative rounded-xl border-2 p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                            {review.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {review.courseName}
                          </p>
                        </div>
                        <Badge className="shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Upcoming
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Start: {formatDate(review.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>End: {formatDate(review.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Card className="border-2 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-background dark:from-green-950/20 dark:to-background px-6 py-5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Published Results</h2>
                  <p className="text-sm text-muted-foreground">
                    {data.recentlyPublishedReviews.length} available
                  </p>
                </div>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            {data.recentlyPublishedReviews.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="rounded-full bg-muted/50 p-6 w-fit mx-auto">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No published results yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back soon for updates
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentlyPublishedReviews.map((review) => (
                  <div
                    key={review.reviewId}
                    className="group relative rounded-xl border-2 p-4 hover:border-primary/50 hover:shadow-md transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                            {review.reviewName}
                          </h4>
                        </div>
                        <Badge className="shrink-0 bg-green-100 text-green-700 hover:bg-green-100">
                          Published
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Published: {formatDateTime(review.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid gap-6 lg:grid-cols-2">
        {}
        <Card className="border-2">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-purple-50 to-background dark:from-purple-950/20 dark:to-background">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Academic Performance</h2>
                <p className="text-sm text-muted-foreground">
                  Your progress overview
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6 space-y-6">
            {}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-500/10 p-1.5">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold">
                    Review Completion
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{completionRate}%</span>
                </div>
              </div>
              <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {data.completedReviews} of {data.totalReviews} reviews completed
              </p>
            </div>

            <Separator />

            {}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-green-500/10 p-1.5">
                    <FolderOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold">
                    Project Completion
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {projectCompletionRate}%
                  </span>
                </div>
              </div>
              <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                  style={{ width: `${projectCompletionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {data.completedProjects} of {data.totalProjects} projects
                completed
              </p>
            </div>

            {data.averageProjectScore > 0 && (
              <>
                <Separator />
                {}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-orange-500/10 p-1.5">
                        <Award className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold">
                        Average Score
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {data.averageProjectScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/50"
                      style={{ width: `${data.averageProjectScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Overall academic performance
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {}
        <Card className="border-2">
          <div className="px-6 py-5 border-b bg-gradient-to-r from-orange-50 to-background dark:from-orange-950/20 dark:to-background">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quick Actions</h2>
                <p className="text-sm text-muted-foreground">
                  Navigate to key areas
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="grid gap-3">
              <Button
                asChild
                variant="outline"
                className="group h-auto p-4 justify-between hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Link href="/reviews">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">
                        View Active Reviews
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Participate in ongoing evaluations
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="group h-auto p-4 justify-between hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Link href="/reviews">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2 group-hover:bg-green-500/20 transition-colors">
                      <FolderOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">My Reviews</p>
                      <p className="text-xs text-muted-foreground">
                        Check review status and submissions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="group h-auto p-4 justify-between hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Link href="/reviews">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-2 group-hover:bg-purple-500/20 transition-colors">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">View Results</p>
                      <p className="text-xs text-muted-foreground">
                        Check published review results
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="group h-auto p-4 justify-between hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Link href="/courses">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500/10 p-2 group-hover:bg-orange-500/20 transition-colors">
                      <BookOpen className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">My Courses</p>
                      <p className="text-xs text-muted-foreground">
                        View enrolled courses and progress
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="group h-auto p-4 justify-between hover:border-primary/50 hover:shadow-md transition-all"
              >
                <Link href="/teams">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2 group-hover:bg-indigo-500/20 transition-colors">
                      <FolderOpen className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">View Teams</p>
                      <p className="text-xs text-muted-foreground">
                        Check your project teams
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
