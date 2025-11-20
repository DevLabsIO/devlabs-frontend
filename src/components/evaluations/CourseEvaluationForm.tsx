"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { individualScoreQueries } from "@/repo/individual-score-queries/individual-score-queries";
import {
  CourseEvaluationData,
  IndividualScoreSubmission,
} from "@/types/features";
import { useSessionContext } from "@/lib/session-context";
import { useEvaluationDraft } from "@/components/evaluations/hooks/useEvaluationDraft";
import { ParticipantScoreData } from "@/repo/evaluation-draft-queries/evaluation-draft-queries";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  Save,
  BarChart3,
  Target,
  TrendingUp,
  Cloud,
  CloudOff,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CriteriaView } from "./CriteriaView";
import { StudentView } from "./StudentView";
import { ViewToggle, useViewMode } from "./ViewToggle";

type FormData = {
  [participantId: string]: {
    [criterionId: string]: {
      score: number;
      comment: string;
    };
  };
};

type CommonCriteriaData = {
  [criterionId: string]: {
    score: number;
    comment: string;
  };
};

interface CourseEvaluationFormProps {
  evaluationData: CourseEvaluationData;
  reviewData?: {
    rubricsInfo?: {
      criteria: Array<{
        id: string;
        isCommon: boolean;
      }>;
    };
  };
  projectId: string;
  reviewId: string;
}

export function CourseEvaluationForm({
  evaluationData,
  reviewData,
  projectId,
  reviewId,
}: CourseEvaluationFormProps) {
  const { user } = useSessionContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useViewMode();

  const isCriterionCommon = useCallback(
    (criterionId: string): boolean => {
      if (!reviewData?.rubricsInfo?.criteria) return false;
      const rubricCriterion = reviewData.rubricsInfo.criteria.find(
        (c) => c.id === criterionId,
      );
      return rubricCriterion?.isCommon === true;
    },
    [reviewData?.rubricsInfo?.criteria],
  );

  const initializeFormData = (): FormData => {
    const data: FormData = {};
    evaluationData.teamMembers.forEach((member) => {
      data[member.id] = {};
      evaluationData.criteria.forEach((criterion) => {
        const existingScore = evaluationData.existingScores
          ?.find((score) => score.participantId === member.id)
          ?.criterionScores.find((cs) => cs.criterionId === criterion.id);
        data[member.id][criterion.id] = {
          score: existingScore?.score ?? 0,
          comment: existingScore?.comment ?? "",
        };
      });
    });
    return data;
  };

  const updateCommonCriteriaScore = (
    criterionId: string,
    field: "score" | "comment",
    value: number | string,
  ) => {
    setCommonCriteriaData((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        [field]: value,
      },
    }));
  };

  const initializeCommonCriteriaData = (): CommonCriteriaData => {
    const data: CommonCriteriaData = {};

    evaluationData.criteria.forEach((criterion) => {
      if (isCriterionCommon(criterion.id)) {
        const firstParticipantId = evaluationData.teamMembers[0]?.id;
        const sourceScores =
          evaluationData.existingScores?.find(
            (s) => s.participantId === firstParticipantId,
          )?.criterionScores ??
          evaluationData.existingScores?.find((s) =>
            s.criterionScores?.some((cs) => cs.criterionId === criterion.id),
          )?.criterionScores;
        const existingScore = sourceScores?.find(
          (cs) => cs.criterionId === criterion.id,
        );

        data[criterion.id] = {
          score: existingScore?.score ?? 0,
          comment: existingScore?.comment ?? "",
        };
      }
    });

    return data;
  };

  const [formData, setFormData] = useState<FormData>(initializeFormData);
  const [commonCriteriaData, setCommonCriteriaData] =
    useState<CommonCriteriaData>(initializeCommonCriteriaData);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const isLoadingDraftRef = useRef(false);

  const handleDraftLoaded = useCallback(
    (draftScores: ParticipantScoreData[]) => {
      if (isDraftLoaded) return;

      isLoadingDraftRef.current = true;

      const newFormData: FormData = {};
      const newCommonData: CommonCriteriaData = {};

      evaluationData.teamMembers.forEach((member) => {
        newFormData[member.id] = {};
        evaluationData.criteria.forEach((criterion) => {
          newFormData[member.id][criterion.id] = {
            score: 0,
            comment: "",
          };
        });
      });

      draftScores.forEach((participantScore) => {
        if (newFormData[participantScore.participantId]) {
          participantScore.criterionScores.forEach((criterionScore) => {
            if (
              newFormData[participantScore.participantId][
                criterionScore.criterionId
              ]
            ) {
              newFormData[participantScore.participantId][
                criterionScore.criterionId
              ] = {
                score: criterionScore.score,
                comment: criterionScore.comment || "",
              };

              if (isCriterionCommon(criterionScore.criterionId)) {
                newCommonData[criterionScore.criterionId] = {
                  score: criterionScore.score,
                  comment: criterionScore.comment || "",
                };
              }
            }
          });
        }
      });

      setFormData(newFormData);
      setCommonCriteriaData(newCommonData);
      setIsDraftLoaded(true);

      setTimeout(() => {
        isLoadingDraftRef.current = false;
      }, 100);
    },
    [evaluationData, isCriterionCommon, isDraftLoaded],
  );

  const { isDraftLoading, isSaving, lastSaveTime, saveDraft } =
    useEvaluationDraft({
      reviewId,
      projectId,
      courseId: evaluationData.courseId,
      enabled: !evaluationData.isPublished,
      onDraftLoaded: handleDraftLoaded,
    });

  useEffect(() => {
    if (!isDraftLoading && !isDraftLoaded) {
      setIsDraftLoaded(true);
    }
  }, [isDraftLoading, isDraftLoaded]);

  const convertFormDataToDraftScores =
    useCallback((): ParticipantScoreData[] => {
      return evaluationData.teamMembers.map((member) => ({
        participantId: member.id,
        criterionScores: evaluationData.criteria.map((criterion) => ({
          criterionId: criterion.id,
          score: isCriterionCommon(criterion.id)
            ? commonCriteriaData[criterion.id]?.score || 0
            : formData[member.id][criterion.id].score,
          comment: isCriterionCommon(criterion.id)
            ? commonCriteriaData[criterion.id]?.comment || null
            : formData[member.id][criterion.id].comment || null,
        })),
      }));
    }, [evaluationData, formData, commonCriteriaData, isCriterionCommon]);

  useEffect(() => {
    if (
      !isDraftLoading &&
      !evaluationData.isPublished &&
      isDraftLoaded &&
      !isLoadingDraftRef.current
    ) {
      const draftScores = convertFormDataToDraftScores();
      saveDraft(draftScores);
    }
  }, [formData, commonCriteriaData]);

  const submitMutation = useMutation({
    mutationFn: (submission: IndividualScoreSubmission) =>
      individualScoreQueries.submitCourseScores(submission),
    onSuccess: () => {
      toast("Evaluation submitted successfully");
      queryClient.invalidateQueries({
        queryKey: [
          "courseEvaluationData",
          reviewId,
          projectId,
          evaluationData.courseId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["evaluationSummary", reviewId, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "evaluationDraft",
          reviewId,
          projectId,
          evaluationData.courseId,
        ],
      });
    },
    onError: () => {
      toast("Failed to submit evaluation. Please try again.");
    },
  });

  const updateScore = (
    participantId: string,
    criterionId: string,
    field: "score" | "comment",
    value: number | string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [criterionId]: {
          ...prev[participantId][criterionId],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const scores = evaluationData.teamMembers.map((member) => ({
      participantId: member.id,
      criterionScores: evaluationData.criteria.map((criterion) => ({
        criterionId: criterion.id,
        score: isCriterionCommon(criterion.id)
          ? commonCriteriaData[criterion.id]?.score || 0
          : formData[member.id][criterion.id].score,
        comment: isCriterionCommon(criterion.id)
          ? commonCriteriaData[criterion.id]?.comment || undefined
          : formData[member.id][criterion.id].comment || undefined,
      })),
    }));

    const submission: IndividualScoreSubmission = {
      userId: user.id,
      reviewId,
      projectId,
      courseId: evaluationData.courseId,
      scores,
    };

    submitMutation.mutate(submission);
  };

  const getCriterionProgress = (criterionId: string) => {
    if (isCriterionCommon(criterionId)) {
      const commonScore = commonCriteriaData[criterionId]?.score || 0;
      return commonScore > 0 ? 100 : 0;
    }

    const completedCount = evaluationData.teamMembers.filter(
      (member) => formData[member.id][criterionId].score > 0,
    ).length;
    return (completedCount / evaluationData.teamMembers.length) * 100;
  };

  return (
    <div className="space-y-6">
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">
                  {evaluationData.courseName}
                </h2>
                {!evaluationData.isPublished && (
                  <div className="flex items-center gap-2 text-sm">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Saving...</span>
                      </>
                    ) : lastSaveTime ? (
                      <>
                        <Cloud className="h-4 w-4 text-emerald-600" />
                        <span className="text-muted-foreground">
                          Saved {lastSaveTime.toLocaleTimeString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Auto-save enabled
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">
                Evaluate {evaluationData.teamMembers.length} team member
                {evaluationData.teamMembers.length !== 1 ? "s" : ""} across{" "}
                {evaluationData.criteria.length} criteria
              </p>
            </div>
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
          </div>
        </CardHeader>
      </Card>

      {/* Published Alert */}
      {evaluationData.isPublished && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            This evaluation has been published. Changes may not be reflected in
            final results.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-background dark:from-blue-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Team Average
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {evaluationData.teamMembers.length > 0
                      ? Math.round(
                          evaluationData.teamMembers.reduce(
                            (totalSum, member) =>
                              totalSum +
                              evaluationData.criteria.reduce(
                                (criteriaSum, criterion) =>
                                  criteriaSum +
                                  (isCriterionCommon(criterion.id)
                                    ? commonCriteriaData[criterion.id]?.score ||
                                      0
                                    : formData[member.id][criterion.id].score ||
                                      0),
                                0,
                              ),
                            0,
                          ) / evaluationData.teamMembers.length,
                        )
                      : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-2 bg-gradient-to-br from-violet-50 to-background dark:from-violet-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-violet-100 dark:bg-violet-900/30">
                <Target className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Maximum Score
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                    {evaluationData.criteria.reduce(
                      (sum, criterion) => sum + criterion.maxScore,
                      0,
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">points</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/20 dark:to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg p-2.5 bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {(() => {
                      const totalFields =
                        evaluationData.teamMembers.length *
                          evaluationData.criteria.filter(
                            (c) => !isCriterionCommon(c.id),
                          ).length +
                        evaluationData.criteria.filter((c) =>
                          isCriterionCommon(c.id),
                        ).length;

                      const filledFields =
                        evaluationData.teamMembers.reduce(
                          (count, member) =>
                            count +
                            evaluationData.criteria.filter(
                              (c) =>
                                !isCriterionCommon(c.id) &&
                                formData[member.id]?.[c.id]?.score > 0,
                            ).length,
                          0,
                        ) +
                        evaluationData.criteria.filter(
                          (c) =>
                            isCriterionCommon(c.id) &&
                            (commonCriteriaData[c.id]?.score || 0) > 0,
                        ).length;

                      return totalFields > 0
                        ? Math.round((filledFields / totalFields) * 100)
                        : 0;
                    })()}
                  </p>
                  <p className="text-sm text-muted-foreground">%</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {viewMode === "criteria" ? (
        <CriteriaView
          evaluationData={evaluationData}
          formData={formData}
          commonCriteriaData={commonCriteriaData}
          isCriterionCommon={isCriterionCommon}
          updateScore={updateScore}
          updateCommonCriteriaScore={updateCommonCriteriaScore}
          getCriterionProgress={getCriterionProgress}
        />
      ) : (
        <StudentView
          evaluationData={evaluationData}
          formData={formData}
          commonCriteriaData={commonCriteriaData}
          isCriterionCommon={isCriterionCommon}
          updateScore={updateScore}
          updateCommonCriteriaScore={updateCommonCriteriaScore}
        />
      )}

      <Card className="border-2 bg-gradient-to-r from-background to-muted/20 sticky bottom-4 shadow-lg">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Ready to submit?</p>
              <p className="text-xs text-muted-foreground">
                Your evaluation will be saved and can be edited later
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              size="lg"
              className="gap-2 px-8 shadow-md"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Evaluation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
