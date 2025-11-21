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
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, Plus, Eye, Archive } from "lucide-react";
import Link from "next/link";

export default function ManagerDashboardPage() {
    const { data: session } = useSession();
    const { data, isLoading, error } = useQuery({
        queryKey: ["dashboard", "manager-staff"],
        queryFn: dashboardQueries.getManagerStaffDashboard,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <LoadingState variant="skeleton" dashboardType="manager" />;
    if (error || !data) return <ErrorState error={error?.message || "Failed to load dashboard"} />;

    const quickActions = [
        {
            href: "/reviews/create",
            icon: Plus,
            title: "Create New Review",
            description: "Set up a new project review",
        },
        {
            href: "/teams",
            icon: FolderOpen,
            title: "Manage Teams",
            description: "View and manage project teams",
        },
        {
            href: "/archives",
            icon: Archive,
            title: "View Archives",
            description: "Browse completed projects and results",
        },
    ];

    const welcomeMessage = session?.user?.name
        ? `Welcome back, ${session.user.name}`
        : "Welcome back";

    return (
        <div className="space-y-6">
            <DashboardHeader
                title={welcomeMessage}
                actions={
                    <>
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
                    </>
                }
            />

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

            <QuickActions actions={quickActions} layout="grid" />
        </div>
    );
}
