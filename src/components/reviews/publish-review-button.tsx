"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import axiosInstance from "@/lib/axios/axios-client";
import { ReviewPublicationStatus } from "@/lib/utils/review-status";

interface PublishReviewButtonProps {
  reviewId: string;
  isPublished: boolean;
  canPublish?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onStatusChange?: (newStatus: ReviewPublicationStatus) => void;
}

export function PublishReviewButton({
  reviewId,
  isPublished,
  canPublish = false,
  variant = "outline",
  size = "sm",
  className,
  onStatusChange,
}: PublishReviewButtonProps) {
  const { session } = useSessionContext();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const publishMutation = useMutation({
    mutationFn: async (action: "publish" | "unpublish") => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const endpoint = `/api/review/${reviewId}/${action}`;
      const response = await axiosInstance.post(endpoint, {
        userId: session.user.id,
      });
      return response.data;
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data: ReviewPublicationStatus, action) => {
      toast.success(
        action === "publish"
          ? "Review published successfully"
          : "Review unpublished successfully",
      );

      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
      onStatusChange?.(data);
    },
    onError: (error: unknown) => {
      const errorMessage =
        (
          error as {
            response?: { data?: { error?: string } };
            message?: string;
          }
        )?.response?.data?.error ||
        (error as { message?: string })?.message ||
        "An error occurred";
      toast.error(
        `Failed to ${
          isPublished ? "unpublish" : "publish"
        } review: ${errorMessage}`,
      );
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const handleClick = () => {
    const action = isPublished ? "unpublish" : "publish";
    publishMutation.mutate(action);
  };

  if (!canPublish) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading || publishMutation.isPending}
    >
      {isLoading || publishMutation.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPublished ? (
        <>
          <EyeOff className="h-4 w-4 mr-2" />
          Unpublish
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Publish
        </>
      )}
    </Button>
  );
}
