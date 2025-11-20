"use client";

import { useEffect, useState } from "react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import { ManagerStaffDashboardData } from "@/types/features";
import StatCard from "./StatCard";
import ReviewList from "./ReviewList";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Plus, Eye, Upload } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manager/Staff Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/reviews/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Review
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/reviews">
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

      <div className="grid gap-6 md:grid-cols-3">
        <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3">
          <Link href="/reviews/create">
            <Plus className="h-8 w-8" />
            <div className="text-center">
              <p className="font-medium">Create New Review</p>
              <p className="text-xs text-muted-foreground">
                Set up a new project review
              </p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3">
          <Link href="/reviews">
            <Upload className="h-8 w-8" />
            <div className="text-center">
              <p className="font-medium">Publish Results</p>
              <p className="text-xs text-muted-foreground">
                Publish completed review results
              </p>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3">
          <Link href="/reviews">
            <FolderOpen className="h-8 w-8" />
            <div className="text-center">
              <p className="font-medium">View Reviews</p>
              <p className="text-xs text-muted-foreground">
                Manage and track review progress
              </p>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}
