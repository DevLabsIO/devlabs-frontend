import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  evaluationDraftQueries,
  ParticipantScoreData,
  SaveDraftRequest,
} from "@/repo/evaluation-draft-queries/evaluation-draft-queries";
import { useToast } from "@/hooks/use-toast";

interface UseEvaluationDraftOptions {
  reviewId: string;
  projectId: string;
  courseId: string;
  enabled?: boolean;
  onDraftLoaded?: (scores: ParticipantScoreData[]) => void;
}

export function useEvaluationDraft({
  reviewId,
  projectId,
  courseId,
  enabled = true,
  onDraftLoaded,
}: UseEvaluationDraftOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<Date | null>(null);

  const draftQuery = useQuery({
    queryKey: ["evaluationDraft", reviewId, projectId, courseId],
    queryFn: () =>
      evaluationDraftQueries.getDraft(reviewId, projectId, courseId),
    enabled: enabled && !!reviewId && !!projectId && !!courseId,
    staleTime: Infinity,
    gcTime: 0,
  });

  useEffect(() => {
    if (draftQuery.data?.exists && draftQuery.data.draft && onDraftLoaded) {
      onDraftLoaded(draftQuery.data.draft.scores);
      const lastUpdated = new Date(draftQuery.data.draft.lastUpdated);
      lastSaveTimeRef.current = lastUpdated;
    }
  }, [draftQuery.data, onDraftLoaded]);

  const saveMutation = useMutation({
    mutationFn: (request: SaveDraftRequest) =>
      evaluationDraftQueries.saveDraft(request),
    onSuccess: (data) => {
      lastSaveTimeRef.current = new Date(data.savedAt);
      queryClient.setQueryData(
        ["evaluationDraft", reviewId, projectId, courseId],
        {
          exists: true,
          draft: {
            reviewId,
            projectId,
            courseId,
            scores: [],
            lastUpdated: data.savedAt,
            isSubmitted: false,
          },
        },
      );
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const responseError = error as { response?: { status?: number } };
        if (responseError.response?.status === 409) {
          toast("Cannot save draft - evaluation already submitted");
        }
      }
    },
  });

  const clearMutation = useMutation({
    mutationFn: () =>
      evaluationDraftQueries.clearDraft(reviewId, projectId, courseId),
    onSuccess: () => {
      queryClient.setQueryData(
        ["evaluationDraft", reviewId, projectId, courseId],
        {
          exists: false,
          draft: null,
        },
      );
      lastSaveTimeRef.current = null;
    },
  });

  const saveDraft = useCallback(
    (scores: ParticipantScoreData[]) => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        saveMutation.mutate({
          reviewId,
          projectId,
          courseId,
          scores,
        });
      }, 1500);
    },
    [reviewId, projectId, courseId, saveMutation],
  );

  const clearDraft = useCallback(() => {
    clearMutation.mutate();
  }, [clearMutation]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isDraftLoading: draftQuery.isLoading,
    hasDraft: draftQuery.data?.exists ?? false,
    draftData: draftQuery.data?.draft,
    isSaving: saveMutation.isPending,
    lastSaveTime: lastSaveTimeRef.current,
    saveDraft,
    clearDraft,
  };
}
