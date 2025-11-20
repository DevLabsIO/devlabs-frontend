/**
 * Evaluation Feature Types
 * Types for project evaluation and scoring
 */

import { Criterion } from "../entities/review.types";

export interface EvaluationCriteria {
  reviewId: string;
  reviewName: string;
  criteria: Criterion[];
}

export interface CriterionScore {
  criterionId: string;
  score: number;
  comment?: string;
}

export interface EvaluationSubmission {
  reviewId: string;
  projectId: string;
  comments?: string;
  criterionScores: CriterionScore[];
}

export interface SubmittedEvaluation {
  id: string;
  reviewId: string;
  reviewName: string;
  projectId: string;
  projectTitle: string;
  evaluatorId: string;
  evaluatorName: string;
  comments?: string;
  criterionScores: (CriterionScore & {
    id: string;
    criterionName: string;
    maxScore: number;
  })[];
  totalScore: number;
  maxPossibleScore: number;
  status: "DRAFT" | "SUBMITTED";
  createdAt: string;
  updatedAt: string;
}

export interface CourseEvaluationSummary {
  reviewId: string;
  reviewName: string;
  projectId: string;
  projectTitle: string;
  teamName: string;
  courseEvaluations: {
    courseId: string;
    courseName: string;
    instructors: {
      id: string;
      name: string;
    }[];
    hasEvaluation: boolean;
    evaluationCount: number;
  }[];
}

export interface CourseEvaluationData {
  courseId: string;
  courseName: string;
  projectId: string;
  reviewId: string;
  teamMembers: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  criteria: {
    id: string;
    name: string;
    description: string;
    maxScore: number;
    courseSpecific: boolean;
    isCommon?: boolean;
  }[];
  existingScores?: {
    participantId: string;
    criterionScores: {
      criterionId: string;
      score: number;
      comment?: string;
    }[];
  }[];
  isPublished: boolean;
}

export interface IndividualScoreCriterionScore {
  criterionId: string;
  score: number;
  comment?: string;
}

export interface IndividualScoreParticipantScore {
  participantId: string;
  criterionScores: IndividualScoreCriterionScore[];
}

export interface IndividualScoreSubmission {
  userId: string;
  reviewId: string;
  projectId: string;
  courseId: string;
  scores: IndividualScoreParticipantScore[];
}
