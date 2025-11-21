"use client";

import { useState } from "react";
import { CourseEvaluationData } from "@/types/features";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScoreSlider } from "./ScoreSlider";

interface FormData {
    [participantId: string]: {
        [criterionId: string]: {
            score: number;
            comment: string;
        };
    };
}

interface CommonCriteriaData {
    [criterionId: string]: {
        score: number;
        comment: string;
    };
}

interface CriteriaViewProps {
    evaluationData: CourseEvaluationData;
    formData: FormData;
    commonCriteriaData: CommonCriteriaData;
    isCriterionCommon: (criterionId: string) => boolean;
    updateScore: (
        participantId: string,
        criterionId: string,
        field: "score" | "comment",
        value: number | string
    ) => void;
    updateCommonCriteriaScore: (
        criterionId: string,
        field: "score" | "comment",
        value: number | string
    ) => void;
    getCriterionProgress: (criterionId: string) => number;
}

export function CriteriaView({
    evaluationData,
    formData,
    commonCriteriaData,
    isCriterionCommon,
    updateScore,
    updateCommonCriteriaScore,
    getCriterionProgress,
}: CriteriaViewProps) {
    const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(
        new Set(evaluationData.criteria.length > 0 ? [evaluationData.criteria[0].id] : [])
    );

    const toggleCriterion = (criterionId: string) => {
        setExpandedCriteria((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(criterionId)) {
                newSet.delete(criterionId);
            } else {
                newSet.add(criterionId);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">Evaluation Criteria</h2>
                    <p className="text-sm text-muted-foreground">
                        {evaluationData.criteria.length} criteria • Click to expand and evaluate
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                            setExpandedCriteria(new Set(evaluationData.criteria.map((c) => c.id)))
                        }
                        className="text-xs"
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCriteria(new Set())}
                        className="text-xs"
                    >
                        Collapse All
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {evaluationData.criteria.map((criterion, index) => {
                    const isExpanded = expandedCriteria.has(criterion.id);
                    const progress = getCriterionProgress(criterion.id);
                    const isComplete = progress === 100;

                    return (
                        <Card
                            key={criterion.id}
                            className={`overflow-hidden transition-all ${
                                isExpanded ? "border-primary/50" : ""
                            }`}
                        >
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => toggleCriterion(criterion.id)}
                            >
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </div>

                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                        isComplete
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {index + 1}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-base">
                                            {criterion.name}
                                        </h3>
                                        {isCriterionCommon(criterion.id) && (
                                            <Badge variant="secondary" className="text-xs">
                                                Common
                                            </Badge>
                                        )}
                                        {criterion.courseSpecific && (
                                            <Badge variant="outline" className="text-xs">
                                                Course Specific
                                            </Badge>
                                        )}
                                    </div>
                                    {criterion.description && !isExpanded && (
                                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                                            {criterion.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div className="text-right">
                                        <div className="text-sm font-medium">
                                            Max: {criterion.maxScore}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {Math.round(progress)}% done
                                        </div>
                                    </div>
                                    <div className="w-12 h-12">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                                className="text-muted"
                                            />
                                            <circle
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 20}`}
                                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                                                className={`${isComplete ? "text-primary" : "text-primary/60"} transition-all duration-500`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <Collapsible open={isExpanded}>
                                <CollapsibleContent>
                                    <div className="border-t bg-muted/10">
                                        {criterion.description && (
                                            <div className="px-4 py-3 bg-muted/20 border-b">
                                                <p className="text-sm text-muted-foreground">
                                                    {criterion.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className="p-4 space-y-4">
                                            {isCriterionCommon(criterion.id) ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 pb-2 border-b">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Team Score
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            Applied to all members
                                                        </span>
                                                    </div>

                                                    <ScoreSlider
                                                        score={
                                                            commonCriteriaData[criterion.id]
                                                                ?.score || 0
                                                        }
                                                        maxScore={criterion.maxScore}
                                                        onChange={(value) =>
                                                            updateCommonCriteriaScore(
                                                                criterion.id,
                                                                "score",
                                                                value
                                                            )
                                                        }
                                                    />

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">
                                                            Comments (Optional)
                                                        </Label>
                                                        <Textarea
                                                            value={
                                                                commonCriteriaData[criterion.id]
                                                                    ?.comment || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateCommonCriteriaScore(
                                                                    criterion.id,
                                                                    "comment",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Add evaluation comments..."
                                                            className="min-h-[100px] resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {evaluationData.teamMembers.map(
                                                        (member, idx) => {
                                                            const currentScore =
                                                                formData[member.id]?.[criterion.id]
                                                                    ?.score ?? 0;
                                                            const currentComment =
                                                                formData[member.id]?.[criterion.id]
                                                                    ?.comment ?? "";

                                                            return (
                                                                <div
                                                                    key={member.id}
                                                                    className="space-y-4 pb-4 border-b last:border-b-0 last:pb-0"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                                                            {idx + 1}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="font-medium text-sm">
                                                                                {member.name}
                                                                            </h4>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {member.email}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <ScoreSlider
                                                                        score={currentScore}
                                                                        maxScore={
                                                                            criterion.maxScore
                                                                        }
                                                                        onChange={(value) =>
                                                                            updateScore(
                                                                                member.id,
                                                                                criterion.id,
                                                                                "score",
                                                                                value
                                                                            )
                                                                        }
                                                                    />

                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-medium text-muted-foreground">
                                                                            Comments (Optional)
                                                                        </Label>
                                                                        <Textarea
                                                                            value={currentComment}
                                                                            onChange={(e) =>
                                                                                updateScore(
                                                                                    member.id,
                                                                                    criterion.id,
                                                                                    "comment",
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            placeholder="Add comments for this member..."
                                                                            className="min-h-[80px] resize-none text-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
