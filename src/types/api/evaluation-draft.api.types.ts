/**
 * Evaluation Draft API Request/Response Types
 * Used in src/repo/evaluation-draft-queries/
 */

export interface CriterionScoreData {
  criterionId: string;
  score: number;
  comment: string | null;
}

export interface ParticipantScoreData {
  participantId: string;
  criterionScores: CriterionScoreData[];
}

export interface EvaluationDraft {
  reviewId: string;
  projectId: string;
  courseId: string;
  evaluatorId: string;
  scores: ParticipantScoreData[];
  lastUpdated: string;
  isSubmitted: boolean;
}

export interface SaveDraftRequest {
  reviewId: string;
  projectId: string;
  courseId: string;
  scores: ParticipantScoreData[];
}

export interface SaveDraftResponse {
  success: boolean;
  savedAt: string;
  message: string;
}

export interface GetDraftResponse {
  exists: boolean;
  draft: EvaluationDraft | null;
}
