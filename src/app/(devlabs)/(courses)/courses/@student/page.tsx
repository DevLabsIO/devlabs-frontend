"use client";

import { useSessionContext } from "@/lib/session-context";
import { useQuery, useQueries } from "@tanstack/react-query";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { StudentCourseCard } from "@/components/student-courses/student-course-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { COURSE_COLORS } from "@/lib/utils/colors";
import { useState, useMemo } from "react";
import {
    PerformanceOverviewChart,
    CoursePerformanceData,
    ReviewPerformance,
} from "@/components/student-courses/performance-overview-chart";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { StudentCourse } from "@/types/entities";
import {
    PerformanceChartSkeleton,
    CourseCardSkeleton,
} from "@/components/student-courses/skeletons";
import { useRouter } from "next/navigation";

type StudentCourseWithColor = StudentCourse & { color: string };

export default function MyCoursesPage() {
    const { session, status, isAuthenticated } = useSessionContext();
    const studentId = session?.user?.id;
    const router = useRouter();
    const handleCardClick = (course: StudentCourse) => {
        router.push(`/courses/${course.id}/results`);
    };
    const {
        data: courses,
        isLoading: isLoadingCourses,
        isError,
    } = useQuery({
        queryKey: ["studentCourses", studentId],
        queryFn: () => courseQueries.getCourseByStudentId(),
        enabled: isAuthenticated && !!studentId,
    });

    const assignColorsToCourses = (coursesArr: StudentCourse[]): StudentCourseWithColor[] => {
        return coursesArr.map((course, index) => ({
            ...course,
            color: COURSE_COLORS[index % COURSE_COLORS.length],
        }));
    };

    const coursesWithColor = useMemo(
        () => (courses ? assignColorsToCourses(courses) : []),
        [courses]
    );

    const performanceQueries = useQueries({
        queries:
            coursesWithColor.map((course) => ({
                queryKey: ["coursePerformance", studentId, course.id],
                queryFn: (): Promise<ReviewPerformance[]> =>
                    courseQueries.getCoursePerformance(studentId!, course.id),
                enabled: !!studentId && coursesWithColor.length > 0,
            })) ?? [],
    });

    const isPerformanceDataLoading =
        performanceQueries.some((q) => q.isLoading) && coursesWithColor.length > 0;

    const performanceData: CoursePerformanceData[] = useMemo(() => {
        if (!coursesWithColor.length) return [];
        return coursesWithColor
            .map((course, index) => {
                const queryResult = performanceQueries[index];
                if (!queryResult.isSuccess || !queryResult.data) return null;
                return {
                    courseId: course.id,
                    courseName: course.name,
                    courseCode: course.code,
                    color: course.color,
                    reviews: queryResult.data,
                };
            })
            .filter((data): data is CoursePerformanceData => data !== null);
    }, [coursesWithColor, performanceQueries]);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("name-asc");

    const filteredAndSortedCourses = useMemo(() => {
        let filtered = [...coursesWithColor];
        if (searchTerm) {
            filtered = filtered.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        filtered.sort((a, b) => {
            if (sortOrder === "name-asc") return a.name.localeCompare(b.name);
            if (sortOrder === "name-desc") return b.name.localeCompare(a.name);
            return 0;
        });
        return filtered;
    }, [coursesWithColor, searchTerm, sortOrder]);

    if (isError) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Failed to load your courses. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const initialLoading = status === "loading" || isLoadingCourses;

    return (
        <div className="space-y-8 p-4 md:p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Enrolled Courses</h1>
            </div>

            {initialLoading || isPerformanceDataLoading ? (
                <PerformanceChartSkeleton />
            ) : (
                <PerformanceOverviewChart performanceData={performanceData} />
            )}

            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search courses by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialLoading
                    ? Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
                    : filteredAndSortedCourses.map((course) => (
                          <StudentCourseCard
                              key={course.id}
                              course={course}
                              onClick={handleCardClick}
                          />
                      ))}
            </div>
        </div>
    );
}
