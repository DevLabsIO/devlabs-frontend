"use client";

import { useEffect, useState } from "react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import { StudentDashboardData } from "@/types/features";
import StatCard from "./StatCard";
import ReviewList from "./ReviewList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, TrendingUp, Eye, BookOpen } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">
          {error || "Failed to load dashboard"}
        </p>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/reviews">
              <Eye className="h-4 w-4 mr-2" />
              Active Reviews
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">
              <BookOpen className="h-4 w-4 mr-2" />
              My Courses
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Reviews"
          value={data.activeReviews}
          subtitle={`${data.completedReviews} completed of ${data.totalReviews} total`}
          icon={FileText}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Active Projects"
          value={data.activeProjects}
          subtitle={`${data.completedProjects} completed of ${data.totalProjects} total`}
          icon={FolderOpen}
          colorClass="text-green-600"
        />
        <StatCard
          title="Review Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${data.completedReviews}/${data.totalReviews} reviews`}
          icon={TrendingUp}
          colorClass="text-purple-600"
        />
        <StatCard
          title="Average Project Score"
          value={
            data.averageProjectScore > 0
              ? `${data.averageProjectScore.toFixed(1)}%`
              : "N/A"
          }
          subtitle="Overall performance"
          icon={TrendingUp}
          colorClass="text-orange-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ReviewList
          title="Upcoming Reviews"
          reviews={data.upcomingReviews}
          type="upcoming"
        />
        <ReviewList
          title="Recently Published Reviews"
          reviews={data.recentlyPublishedReviews}
          type="published"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Review Completion</span>
                <span className="text-sm text-muted-foreground">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Project Completion</span>
                <span className="text-sm text-muted-foreground">
                  {projectCompletionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${projectCompletionRate}%` }}
                ></div>
              </div>

              {data.averageProjectScore > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Score</span>
                    <span className="text-sm text-muted-foreground">
                      {data.averageProjectScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${data.averageProjectScore}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button
                asChild
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Link href="/reviews">
                  <FileText className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">View Active Reviews</p>
                    <p className="text-xs text-muted-foreground">
                      Participate in ongoing evaluations
                    </p>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Link href="/reviews">
                  <FolderOpen className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">My Reviews</p>
                    <p className="text-xs text-muted-foreground">
                      Check review status and submissions
                    </p>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Link href="/reviews">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">View Results</p>
                    <p className="text-xs text-muted-foreground">
                      Check published review results
                    </p>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <Link href="/courses">
                  <BookOpen className="h-4 w-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">My Courses</p>
                    <p className="text-xs text-muted-foreground">
                      View enrolled courses and progress
                    </p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
