"use client";
import React from "react";
import { Course } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CourseHeaderProps {
  course: Course | undefined;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const handleExport = () => {
    const csvContent = [
      ["Course Name", course?.name],
      ["Course Code", course?.code],
      ["Description", course?.description],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${course?.code}_performance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {course?.name}
            </h1>
            <p className="text-muted-foreground">{course?.code}</p>
            {course?.description && (
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                {course.description}
              </p>
            )}
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseHeader;
