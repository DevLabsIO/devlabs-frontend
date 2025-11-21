"use client";
import { useParams, useRouter } from "next/navigation";
import { resultQueries } from "@/repo/result-queries/result-queries";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, AlertCircle, Edit } from "lucide-react";
import Link from "next/link";
import { GROUPS } from "@/types/auth/roles";

const getScoreGrade = (percentage: number) => {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 80) return "Very Good";
  if (percentage >= 70) return "Good";
  if (percentage >= 60) return "Satisfactory";
  return "Needs Improvement";
};

const getScoreColor = (percentage: number) => {
  if (percentage >= 90) return "text-green-600 dark:text-green-400";
  if (percentage >= 80) return "text-blue-600 dark:text-blue-400";
  if (percentage >= 70) return "text-indigo-600 dark:text-indigo-400";
  if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const ResultsSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl">
    <div className="flex items-center space-x-4 mb-6">
      <Skeleton className="h-9 w-32" />
    </div>

    <div className="space-y-2">
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-6 w-96" />
      <div className="flex items-center space-x-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>

    <div className="grid gap-6 mt-6">
      {[1, 2].map((i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <div className="bg-muted/30 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="space-y-3 p-4 rounded-lg bg-muted/20 border"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ResultsPage() {
  const { reviewid, projectid } = useParams();
  const { session, status, user } = useSessionContext();
  const router = useRouter();

  const userGroups = user?.groups as string[] | undefined;
  const canEditMarks =
    user &&
    userGroups &&
    (userGroups.includes(GROUPS.FACULTY) ||
      userGroups.includes(GROUPS.ADMIN) ||
      userGroups.includes(GROUPS.MANAGER));

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["results", reviewid, projectid, session?.user?.id],
    queryFn: () =>
      resultQueries.getResults(
        reviewid as string,
        projectid as string,
        session?.user?.id as string,
      ),
    enabled: !!reviewid && !!projectid && !!session?.user?.id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  if (status === "loading" || isLoading) {
    return <ResultsSkeleton />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md border rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">Authentication Required</h2>
              <p className="text-muted-foreground">
                Please sign in to view results
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md border rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">Error Loading Results</h2>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md border rounded-lg p-6">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-slate-500" />
            <div className="text-center">
              <h2 className="text-lg font-semibold">No Results Found</h2>
              <p className="text-muted-foreground">
                No evaluation results are available for this project
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
      </div>

      <div className="space-y-6">
        {}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {results.projectTitle}
              </h1>
              <p className="text-muted-foreground">
                {results.reviewName} - Evaluation Results
              </p>
            </div>
            {canEditMarks && (
              <Button
                asChild
                size="default"
                variant="outline"
                className="gap-2"
              >
                <Link href={`/evaluate/${projectid}/${reviewid}`}>
                  <Edit className="h-4 w-4" />
                  Edit Evaluations
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Badge variant={results.isPublished ? "default" : "secondary"}>
              {results.isPublished ? "Published" : "Not Published"}
            </Badge>
            {results.canViewAllResults && (
              <span className="text-sm text-muted-foreground">
                {results.results.length} Student
                {results.results.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {}
        <div className="space-y-6">
          {results.results.map((student, index) => (
            <div
              key={`${student.studentId}-${index}`}
              className="border rounded-lg overflow-hidden"
            >
              {}
              <div className="bg-muted/30 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getScoreGrade(student.percentage)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${getScoreColor(student.percentage)}`}
                    >
                      {student.percentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {student.totalScore} / {student.maxPossibleScore} pts
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Score</span>
                    <span className="text-muted-foreground">
                      {student.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={student.percentage} className="h-2" />
                </div>
              </div>

              {}
              <div className="p-6">
                <h4 className="font-semibold mb-4">Assessment Breakdown</h4>

                <div className="space-y-4">
                  {student.scores.map((criterion, criterionIndex) => {
                    const criterionPercentage =
                      (criterion.score / criterion.maxScore) * 100;

                    return (
                      <div
                        key={`${criterion.criterionId}-${criterionIndex}`}
                        className="space-y-3 p-4 rounded-lg border bg-muted/20"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">
                            {criterion.criterionName}
                          </h5>
                          <Badge variant="outline" className="font-mono">
                            {criterion.score} / {criterion.maxScore}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Score</span>
                            <span className="font-medium">
                              {criterionPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress
                            value={criterionPercentage}
                            className="h-1.5"
                          />
                        </div>

                        {criterion.comment && (
                          <div className="mt-3 p-3 bg-background rounded-md border">
                            <p className="text-xs text-muted-foreground mb-1 font-medium">
                              Feedback
                            </p>
                            <p className="text-sm leading-relaxed">
                              {criterion.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
