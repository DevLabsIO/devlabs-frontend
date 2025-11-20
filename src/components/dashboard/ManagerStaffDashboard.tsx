"use client";

import { useEffect, useState } from "react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import { ManagerStaffDashboardData } from "@/types/features";
import StatCard from "./StatCard";
import ReviewList from "./ReviewList";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Plus, Eye, Archive } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ManagerStaffDashboard() {
  const [data, setData] = useState<ManagerStaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardQueries.getManagerStaffDashboard();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Manager/Staff Dashboard
        </h1>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href="/reviews/create" className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/reviews" className="whitespace-nowrap">
              <Eye className="h-4 w-4 mr-2" />
              View Reviews
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Reviews"
          value={data.totalReviews}
          icon={FileText}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Active Reviews"
          value={data.activeReviews}
          icon={FileText}
          colorClass="text-green-600"
        />
        <StatCard
          title="Completed Reviews"
          value={data.completedReviews}
          icon={FileText}
          colorClass="text-gray-600"
        />
        <StatCard
          title="Total Projects"
          value={data.totalProjects}
          icon={FolderOpen}
          colorClass="text-purple-600"
        />
        <StatCard
          title="Active Projects"
          value={data.activeProjects}
          icon={FolderOpen}
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Button
          asChild
          variant="outline"
          className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 overflow-hidden"
        >
          <Link href="/reviews/create" className="w-full overflow-hidden">
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="text-center w-full min-w-0 overflow-hidden px-2">
              <p className="font-medium text-sm sm:text-base truncate">
                Create New Review
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                Set up a new project review
              </p>
            </div>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 overflow-hidden"
        >
          <Link href="/teams" className="w-full overflow-hidden">
            <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="text-center w-full min-w-0 overflow-hidden px-2">
              <p className="font-medium text-sm sm:text-base truncate">
                Manage Teams
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                View and manage project teams
              </p>
            </div>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="h-auto p-4 sm:p-6 flex-col gap-2 sm:gap-3 overflow-hidden"
        >
          <Link href="/archives" className="w-full overflow-hidden">
            <Archive className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
            <div className="text-center w-full min-w-0 overflow-hidden px-2">
              <p className="font-medium text-sm sm:text-base truncate">
                View Archives
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                Browse completed projects and results
              </p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
