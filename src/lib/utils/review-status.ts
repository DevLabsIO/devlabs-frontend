export type ReviewStatus = "UPCOMING" | "LIVE" | "COMPLETED";

export interface ReviewPublicationStatus {
  reviewId: string;
  reviewName: string;
  isPublished: boolean;
  publishDate: string | null;
  canPublish?: boolean;
}

export function calculateReviewStatus(
  startDate: string | Date,
  endDate: string | Date,
): ReviewStatus {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);

  const start = new Date(
    startDate + (typeof startDate === "string" ? "T00:00:00.000Z" : ""),
  );
  const end = new Date(
    endDate + (typeof endDate === "string" ? "T23:59:59.999Z" : ""),
  );

  if (istNow < start) {
    return "UPCOMING";
  }

  if (istNow >= start && istNow <= end) {
    return "LIVE";
  }

  if (istNow > end) {
    return "COMPLETED";
  }

  return "UPCOMING";
}

export function getStatusColor(status: ReviewStatus): string {
  switch (status) {
    case "LIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800";
    case "UPCOMING":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    case "COMPLETED":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
  }
}

export function formatStatus(status: ReviewStatus): string {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "LIVE":
      return "Live";
    case "COMPLETED":
      return "Completed";
    default:
      return "Unknown";
  }
}

export function getStatusDescription(
  _status: ReviewStatus,
  _startDate: string | Date,
  _endDate: string | Date,
): string {
  return "";
}
