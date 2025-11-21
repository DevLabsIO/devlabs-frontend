"use client";

import type { StudentCourse } from "@/types/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudentCourseCardProps {
    course: StudentCourse & { color: string };
    onClick: (course: StudentCourse) => void;
}

const getScoreBadgeClass = (score: number) => {
    if (score >= 75) return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    if (score >= 50) return "bg-slate-50 text-slate-700 border-slate-200/80";
    return "bg-rose-50 text-rose-700 border-rose-200/80";
};

export const StudentCourseCard = ({ course, onClick }: StudentCourseCardProps) => {
    const score = course.averageScorePercentage;

    return (
        <div
            className="relative group transition-transform duration-300 ease-in-out hover:-translate-y-1 rounded-lg overflow-hidden"
            onClick={() => onClick(course)}
        >
            <Card
                className="h-full rounded-lg shadow-sm group-hover:shadow-xl transition-shadow duration-300 border-l-5"
                style={{ borderLeftColor: course.color }}
            >
                <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <p className="pb-1 text-sm font-medium text-muted-foreground">
                                {course.code}
                            </p>
                            <CardTitle className="text-lg font-semibold leading-tight">
                                {course.name}
                            </CardTitle>
                        </div>
                        <Badge
                            variant="outline"
                            className={`whitespace-nowrap font-medium ${getScoreBadgeClass(score)}`}
                        >
                            {score.toFixed(1)}%
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {course.reviewCount}
                        {course.reviewCount === 1 ? " Review " : " Reviews "}
                        Completed
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
