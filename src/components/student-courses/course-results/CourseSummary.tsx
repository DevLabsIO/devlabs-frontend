"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Course, User } from "@/types/entities";

interface CourseSummaryProps {
  course: Course | undefined;
  instructors: User[] | undefined;
  stats: {
    total: number;
    completed: number;
    upcoming: number;
    live: number;
    missed: number;
  };
  normalizedAverageScore: number;
  totalScore: number;
  maxScore: number;
}

const CourseSummary: React.FC<CourseSummaryProps> = ({
  course,
  instructors,
  stats,
  normalizedAverageScore,
  totalScore,
  maxScore,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Class</p>
            <p className="text-lg">{course?.code}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Instructor
            </p>
            <p className="text-lg">
              {instructors?.map((i) => i.name).join(", ")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <p>Total Reviews</p>
            <span className="font-bold">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <p>Completed</p>
            <span className="font-bold">{stats.completed}</span>
          </div>
          <div className="flex justify-between items-center">
            <p>Upcoming</p> <span className="font-bold">{stats.upcoming}</span>
          </div>
          <div className="flex justify-between items-center">
            <p>Live</p>
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {stats.live}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p>Missed</p>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {stats.missed}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Normalized Average Score
          </p>
          <div className="flex items-center gap-4">
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${normalizedAverageScore}%` }}
              ></div>
            </div>
            <span className="font-bold text-lg">
              {normalizedAverageScore.toFixed(1)}%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Total Score</p>
            <p className="text-lg font-bold">
              {totalScore.toFixed(1)} / {maxScore.toFixed(1)} points
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseSummary;
