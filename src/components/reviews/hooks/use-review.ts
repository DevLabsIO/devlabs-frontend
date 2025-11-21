import reviewQueries from "@/repo/review-queries/review-queries";
import { useQuery } from "@tanstack/react-query";

export const useReview = (reviewId: string) => {
    return useQuery({
        queryKey: ["review", reviewId],
        queryFn: async () => {
            return reviewQueries.getReviewById(reviewId);
        },
        enabled: !!reviewId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};
