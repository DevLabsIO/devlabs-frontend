"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Award, ChevronRight } from "lucide-react";
import type { CourseData } from "@/types/entities";

interface CourseGridProps {
  courses: CourseData[];
}

const getBadgeVariant = (type: string) => {
  switch (type) {
    case "CORE":
      return "default";
    case "ELECTIVE":
      return "secondary";
    case "MICRO_CREDENTIAL":
      return "outline";
    default:
      return "default";
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return "bg-emerald-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 60) return "bg-amber-500";
  return "bg-red-500";
};

export default function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card
          key={course.id}
          className="overflow-hidden bg-gradient-to-br from-card to-card/80 border border-border/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20 hover:translate-y-[-3px] cursor-pointer group"
          onClick={() => console.log(`Navigate to course ${course.id}`)}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={getBadgeVariant(course.type)} className="mb-2">
                  {course.type.replace("_", " ")}
                </Badge>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {course.name}
                </h3>
              </div>
              <div className="rounded-full bg-secondary/50 p-2 group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">
                    {course.progressPercentage}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary/70">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(
                      course.progressPercentage,
                    )}`}
                    style={{ width: `${course.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {course.totalProjects} Project
                      {course.totalProjects !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>
                      {course.totalReviews} Review
                      {course.totalReviews !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {course.lastReviewDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Last reviewed:
                    {new Date(course.lastReviewDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
