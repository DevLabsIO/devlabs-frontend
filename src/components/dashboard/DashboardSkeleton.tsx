import {
  StatCardSkeleton,
  ReviewListSkeleton,
  QuickActionsSkeleton,
  PerformanceChartSkeleton,
  RecentUsersSkeleton,
  DashboardHeaderSkeleton,
} from "./DashboardSkeletons";

interface DashboardSkeletonProps {
  variant: "admin" | "manager" | "faculty" | "student";
}

export default function DashboardSkeleton({ variant }: DashboardSkeletonProps) {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />

      {variant === "admin" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RecentUsersSkeleton />
            <QuickActionsSkeleton />
          </div>
        </>
      )}

      {(variant === "manager" || variant === "faculty") && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ReviewListSkeleton />
            <ReviewListSkeleton />
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-32 sm:h-40 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 sm:h-40 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 sm:h-40 bg-muted animate-pulse rounded-lg" />
          </div>
        </>
      )}

      {variant === "student" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ReviewListSkeleton />
            <ReviewListSkeleton />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <PerformanceChartSkeleton />
            <QuickActionsSkeleton />
          </div>
        </>
      )}
    </div>
  );
}
