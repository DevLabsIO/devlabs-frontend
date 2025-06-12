"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Review } from "@/types/types";
import { Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface ReviewCardProps {
  review: Review;
  projectId: string;
  projectCourses: { id: string; name: string; code?: string }[];
}

export default function ReviewCard({
  review,
  projectId,
  projectCourses,
}: ReviewCardProps) {
  const user = useCurrentUser();
  const canEvaluate =
    user && ["ADMIN", "FACULTY", "MANAGER"].includes(user.role);

  const getStatusBadgeColor = (status: Review["status"]) => {
    switch (status) {
      case "LIVE":
        return "bg-green-500 hover:bg-green-600";
      case "SCHEDULED":
        return "bg-blue-500 hover:bg-blue-600";
      case "COMPLETED":
        return "bg-gray-500 hover:bg-gray-600";
      case "CANCELLED":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const relevantCourses = review.courses.filter((course) =>
    projectCourses.some((pc) => pc.id === course.id)
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="font-bold">{review.name}</span>
          <Badge className={`${getStatusBadgeColor(review.status)} text-white`}>
            {review.status}
          </Badge>
        </CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground pt-1">
          <Calendar className="mr-2 h-4 w-4" />
          {format(new Date(review.startDate), "MMM d, yyyy")} -{" "}
          {format(new Date(review.endDate), "MMM d, yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-center text-sm">
          <Tag className="mr-2 h-4 w-4" />
          <span className="font-semibold">Rubric:&nbsp;</span>
          <span>{review.rubricsInfo.name}</span>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">Relevant Courses</h4>
          <div className="flex flex-wrap gap-1">
            {relevantCourses.slice(0, 3).map((course) => (
              <Badge key={course.id} variant="secondary">
                {course.name}
              </Badge>
            ))}
            {relevantCourses.length > 3 && (
              <Badge variant="outline">
                +{relevantCourses.length - 3} more
              </Badge>
            )}
            {relevantCourses.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No courses in this review match the project&apos;s courses.
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {review.status === "LIVE" && canEvaluate && (
          <Link href={`/evaluate/${projectId}/${review.id}`} className="w-full">
            <Button className="w-full">Evaluate</Button>
          </Link>
        )}
        {review.status !== "LIVE" && (
          <Button variant="outline" className="w-full" disabled>
            View Results
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
