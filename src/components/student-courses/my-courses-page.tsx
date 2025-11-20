"use client";

import * as React from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { StudentCourse } from "@/types/entities";
import {
  PerformanceOverviewChart,
  CoursePerformanceData,
  ReviewPerformance,
} from "./performance-overview-chart";
import { StudentCourseCard } from "./student-course-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { COURSE_COLORS } from "@/lib/utils/colors";
import { useRouter } from "next/navigation";

type StudentCourseWithColor = StudentCourse & { color: string };

const assignColorsToCourses = (
  courses: StudentCourse[],
): StudentCourseWithColor[] => {
  return courses.map((course, index) => ({
    ...course,
    color: COURSE_COLORS[index % COURSE_COLORS.length],
  }));
};

export function MyCoursesPage() {
  const user = useCurrentUser();
  const studentId = user?.id;
  const router = useRouter();

  const handleCardClick = (course: StudentCourse) => {
    router.push(`/courses/${course.id}`);
  };

  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: ["studentCourses", studentId],
    queryFn: () => courseQueries.getCourseByStudentId(),
    enabled: !!studentId,
  });

  const coursesWithColor = React.useMemo(
    () => (courses ? assignColorsToCourses(courses) : []),
    [courses],
  );

  const performanceQueries = useQueries({
    queries:
      coursesWithColor.map((course) => ({
        queryKey: ["coursePerformance", studentId, course.id],
        queryFn: (): Promise<ReviewPerformance[]> =>
          courseQueries.getCoursePerformance(studentId!, course.id),
        enabled: !!studentId,
      })) ?? [],
  });

  const performanceData: CoursePerformanceData[] = React.useMemo(() => {
    return coursesWithColor
      .map((course, index) => {
        const queryResult = performanceQueries[index];
        return {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          color: course.color,
          reviews: (queryResult.data as ReviewPerformance[]) || [],
        };
      })
      .filter((_data, index) => performanceQueries[index].isSuccess);
  }, [coursesWithColor, performanceQueries]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState("name-asc");

  const filteredAndSortedCourses = React.useMemo(() => {
    if (!coursesWithColor) return [];
    let filtered = [...coursesWithColor];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      if (sortOrder === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return filtered;
  }, [coursesWithColor, searchTerm, sortOrder]);

  if (isLoadingCourses) {
    return (
      <div className="container mx-auto p-4 text-center">
        Loading your courses...
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        Error loading courses. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-lg text-muted-foreground">
          Browse and access all your enrolled courses
        </p>
      </div>

      <PerformanceOverviewChart performanceData={performanceData} />

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
        <div className="flex gap-4">
          <Select value={"all-semesters"} onValueChange={() => {}}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-semesters">All Semesters</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCourses.map((course) => (
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
