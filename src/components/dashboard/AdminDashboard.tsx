"use client";

import { useEffect, useState } from "react";
import { dashboardQueries } from "@/repo/dashboard-queries/dashboard-queries";
import { AdminDashboardData } from "@/types/features";
import StatCard from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, GraduationCap, BookOpen, Calendar, Settings, UserPlus } from "lucide-react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const dashboardData = await dashboardQueries.getAdminDashboard();
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
                <p className="text-destructive">{error || "Failed to load dashboard"}</p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/user" className="whitespace-nowrap">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Manage Users
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/settings" className="whitespace-nowrap">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Link>
                    </Button>
                </div>
            </div>

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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="justify-start h-auto p-3 sm:p-4 w-full"
                            >
                                <Link href="/user" className="w-full overflow-hidden">
                                    <UserPlus className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                                    <div className="text-left min-w-0 flex-1 overflow-hidden">
                                        <p className="font-medium text-sm truncate">Manage Users</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                                            View and manage all users
                                        </p>
                                    </div>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="justify-start h-auto p-3 sm:p-4 w-full"
                            >
                                <Link href="/semester" className="w-full overflow-hidden">
                                    <Calendar className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                                    <div className="text-left min-w-0 flex-1 overflow-hidden">
                                        <p className="font-medium text-sm truncate">
                                            Manage Semesters
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                                            Create and configure semesters
                                        </p>
                                    </div>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="justify-start h-auto p-3 sm:p-4 w-full"
                            >
                                <Link href="/department" className="w-full overflow-hidden">
                                    <BookOpen className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                                    <div className="text-left min-w-0 flex-1 overflow-hidden">
                                        <p className="font-medium text-sm truncate">
                                            Manage Departments
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                                            Create and configure departments
                                        </p>
                                    </div>
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="justify-start h-auto p-3 sm:p-4 w-full"
                            >
                                <Link href="/batch" className="w-full overflow-hidden">
                                    <GraduationCap className="h-4 w-4 mr-2 sm:mr-3 flex-shrink-0" />
                                    <div className="text-left min-w-0 flex-1 overflow-hidden">
                                        <p className="font-medium text-sm truncate">
                                            Manage Batches
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                                            Create and configure student batches
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
