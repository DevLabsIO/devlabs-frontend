import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resultQueries } from "@/repo/result-queries/result-queries";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProjectResult } from "@/types/features";
import { BarChart3, TrendingUp, Award, Eye, EyeOff } from "lucide-react";

interface ReviewResultsProps {
  reviewId: string;
  projectId: string;
}

export function ReviewResults({ reviewId, projectId }: ReviewResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const currentUser = useCurrentUser();

  const {
    data: results,
    isLoading,
    error,
  } = useQuery<ProjectResult>({
    queryKey: ["reviewResults", reviewId, projectId, currentUser?.id],
    queryFn: () =>
      resultQueries.getResults(reviewId, projectId, currentUser?.id || ""),
    enabled: !!(reviewId && projectId && currentUser?.id),
    staleTime: 2 * 60 * 1000, // 2 minutes - results may update during evaluation
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate team average and max score from results
  const teamAverage = results?.results.length
    ? results.results.reduce((sum, result) => sum + result.percentage, 0) /
      results.results.length
    : 0;

  const maxPossibleScore = results?.results.length
    ? results.results[0]?.maxPossibleScore || 0
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 border rounded-lg bg-background">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Review Results</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const axiosError = error as {
      response?: { status?: number; data?: { error?: string } };
    };
    const errorMessage =
      axiosError?.response?.data?.error || "Failed to load results";

    // Show "Review not yet published" message for 403 errors
    if (
      axiosError?.response?.status === 403 ||
      errorMessage.includes("published")
    ) {
      return (
        <div className="space-y-4 p-6 border rounded-lg bg-background">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Review Results</h3>
          </div>
          <Alert>
            <AlertDescription>Review not yet published</AlertDescription>
          </Alert>
        </div>
      );
    }

    return (
      <div className="space-y-4 p-6 border rounded-lg bg-background">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Review Results</h3>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load results. {errorMessage}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 90) return <Award className="h-4 w-4 text-green-600" />;
    if (percentage >= 80)
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    if (percentage >= 70)
      return <BarChart3 className="h-4 w-4 text-yellow-600" />;
    return <BarChart3 className="h-4 w-4 text-red-600" />;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg bg-background">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Review Results</h3>
        </div>
        <Badge variant="secondary">Published</Badge>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Team Average
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {teamAverage.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Total Students
              </p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {results.results.length}
              </p>
            </div>
            <Award className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Max Score
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {maxPossibleScore}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Toggle Details Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="gap-2"
        >
          {showDetails ? (
            <>
              <EyeOff className="h-4 w-4" />
              Hide Details
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Show Details
            </>
          )}
        </Button>
      </div>

      {/* Detailed Results */}
      {showDetails && (
        <div className="space-y-4">
          <h4 className="text-base font-semibold">Individual Results</h4>
          <div className="grid gap-4">
            {results.results.map((result) => (
              <div
                key={result.studentId}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-muted/20"
              >
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getPerformanceIcon(result.percentage)}
                    <div className="min-w-0 flex-1">
                      <h5 className="font-medium truncate">
                        {result.studentName}
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {result.totalScore} / {result.maxPossibleScore} points
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-lg font-bold ${getScoreColor(
                        result.percentage,
                      )}`}
                    >
                      {result.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Criteria Breakdown */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Criteria Breakdown:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {result.scores.map((score, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm"
                      >
                        <span
                          className="truncate mr-2 flex-1"
                          title={score.criterionName}
                        >
                          {score.criterionName}
                        </span>
                        <span className="font-medium text-right flex-shrink-0">
                          {score.score}/{score.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
