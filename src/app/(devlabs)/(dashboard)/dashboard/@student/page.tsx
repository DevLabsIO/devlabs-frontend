"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import StatCard from "@/components/dashboard/StatCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import ReviewList from "@/components/dashboard/ReviewList";
import QuickActions from "@/components/dashboard/QuickActions";
import { FileText, FolderOpen, TrendingUp, BookOpen, Eye } from "lucide-react";

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "student"],
    queryFn: dashboardQueries.getStudentDashboard,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return <LoadingState variant="skeleton" dashboardType="student" />;
  if (error || !data)
    return <ErrorState error={error?.message || "Failed to load dashboard"} />;

  const completionRate =
    data.totalReviews > 0
      ? (data.completedReviews / data.totalReviews) * 100
      : 0;

  const welcomeMessage = session?.user?.name
    ? `Welcome back, ${session.user.name}`
    : "Welcome back";

  const quickActions = [
    {
      href: "/courses",
      icon: BookOpen,
      title: "My Courses",
      description: "View enrolled courses and materials",
    },
    {
      href: "/reviews",
      icon: Eye,
      title: "View Reviews",
      description: "Check active and completed reviews",
    },
    {
      href: "/teams",
      icon: FolderOpen,
      title: "View Teams",
      description: "Check your project teams",
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader title={welcomeMessage} />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          value={`${Math.round(completionRate)}%`}
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
          subtitle="Active semester only"
          icon={TrendingUp}
          colorClass="text-orange-600"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 min-h-[400px]">
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

      <QuickActions actions={quickActions} layout="grid" />
    </div>
  );
}
