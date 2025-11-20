"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import StatCard from "@/components/dashboard/StatCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import QuickActions from "@/components/dashboard/QuickActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: dashboardQueries.getAdminDashboard,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return <LoadingState variant="skeleton" dashboardType="admin" />;
  if (error || !data)
    return <ErrorState error={error?.message || "Failed to load dashboard"} />;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const quickActions = [
    {
      href: "/user",
      icon: UserPlus,
      title: "Manage Users",
      description: "View and manage all users",
    },
    {
      href: "/semester",
      icon: Calendar,
      title: "Manage Semesters",
      description: "Create and configure semesters",
    },
    {
      href: "/department",
      icon: BookOpen,
      title: "Manage Departments",
      description: "Create and configure departments",
    },
    {
      href: "/batch",
      icon: GraduationCap,
      title: "Manage Batches",
      description: "Create and configure student batches",
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
              <Link href="/user">
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.userStats.total}
          subtitle={`${data.userStats.students} students, ${data.userStats.faculty} faculty, ${data.userStats.managers} managers`}
          icon={Users}
          colorClass="text-blue-600"
        />
        <StatCard
          title="Active Semesters"
          value={data.semesterStats.active}
          subtitle={`${data.semesterStats.total} total semesters`}
          icon={Calendar}
          colorClass="text-green-600"
        />
        <StatCard
          title="Active Courses"
          value={data.courseStats.active}
          subtitle={`${data.courseStats.total} total courses`}
          icon={BookOpen}
          colorClass="text-purple-600"
        />
        <StatCard
          title="Active Batches"
          value={data.batchStats.active}
          subtitle={`${data.batchStats.total} total batches`}
          icon={GraduationCap}
          colorClass="text-orange-600"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent users</p>
            ) : (
              <div className="space-y-3">
                {data.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium">{user.role}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <QuickActions actions={quickActions} />
      </div>
    </div>
  );
}
