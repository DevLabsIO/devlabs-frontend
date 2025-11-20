import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpcomingReview, RecentlyPublishedReview } from "@/types/entities";
import { Calendar, Clock } from "lucide-react";

interface ReviewListProps {
  title: string;
  reviews: UpcomingReview[] | RecentlyPublishedReview[];
  type: "upcoming" | "published";
}

export default function ReviewList({ title, reviews, type }: ReviewListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getReviewKey = (review: UpcomingReview | RecentlyPublishedReview) => {
    return type === "upcoming"
      ? (review as UpcomingReview).id
      : (review as RecentlyPublishedReview).reviewId;
  };

  const getReviewName = (review: UpcomingReview | RecentlyPublishedReview) => {
    return type === "upcoming"
      ? (review as UpcomingReview).name
      : (review as RecentlyPublishedReview).reviewName;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reviews to display</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={getReviewKey(review)}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">
                    {getReviewName(review)}
                  </h4>
                  <Badge
                    variant={type === "upcoming" ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {type === "upcoming" ? "Upcoming" : "Published"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {review.courseName}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {type === "upcoming" ? (
                    <>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate((review as UpcomingReview).startDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDate((review as UpcomingReview).endDate)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDateTime(
                            (review as RecentlyPublishedReview).publishedAt,
                          )}
                        </span>
                      </div>
                      <span>
                        by {(review as RecentlyPublishedReview).publishedBy}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
