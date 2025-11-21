"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { RubricDisplay } from "@/components/reviews/rubric-display";
import type { Review } from "@/types/entities";

interface ReviewDetailsTabProps {
    review: Review;
    reviewStatus: string | null;
}

export function ReviewDetailsTab({ review, reviewStatus }: ReviewDetailsTabProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "UPCOMING":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "LIVE":
                return "bg-green-500/10 text-green-500 border-green-500/20";
            case "COMPLETED":
                return "bg-gray-500/10 text-gray-500 border-gray-500/20";
            default:
                return "";
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0) + status.slice(1).toLowerCase();
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Schedule Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Start Date</h4>
                                <p className="text-muted-foreground">
                                    {review.startDate
                                        ? format(new Date(review.startDate), "PPP")
                                        : "Not set"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">End Date</h4>
                                <p className="text-muted-foreground">
                                    {review.endDate
                                        ? format(new Date(review.endDate), "PPP")
                                        : "Not set"}
                                </p>
                            </div>
                            {review.publishedAt && (
                                <div>
                                    <h4 className="font-medium mb-2">Published At</h4>
                                    <p className="text-muted-foreground">
                                        {format(new Date(review.publishedAt), "PPP 'at' pp")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Created By
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {review.createdBy ? (
                            <div className="space-y-2">
                                <p className="font-medium">{review.createdBy.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {review.createdBy.email}
                                </p>
                                <Badge variant="outline">{review.createdBy.role}</Badge>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Unknown creator</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Review Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-medium mb-2">Publication Status</h4>
                                <Badge variant={review.isPublished ? "default" : "secondary"}>
                                    {review.isPublished ? "Published" : "Not Published"}
                                </Badge>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Review Status</h4>
                                {reviewStatus && (
                                    <Badge
                                        variant="outline"
                                        className={getStatusColor(reviewStatus)}
                                    >
                                        {formatStatus(reviewStatus)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <RubricDisplay rubric={review.rubricsInfo} />
        </div>
    );
}
