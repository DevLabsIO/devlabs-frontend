"use client";

import { useState } from "react";
import { CourseEvaluationData } from "@/types/features";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, User } from "lucide-react";
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

interface StudentViewProps {
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
}

export function StudentView({
    evaluationData,
    formData,
    commonCriteriaData,
    isCriterionCommon,
    updateScore,
    updateCommonCriteriaScore,
}: StudentViewProps) {
    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(
        new Set<string>(evaluationData.teamMembers[0]?.id ? [evaluationData.teamMembers[0].id] : [])
    );

    const toggleStudent = (studentId: string) => {
        setExpandedStudents((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const getStudentProgress = (studentId: string) => {
        const totalCriteria = evaluationData.criteria.length;
        const completedCriteria = evaluationData.criteria.filter((criterion) => {
            if (isCriterionCommon(criterion.id)) {
                return (commonCriteriaData[criterion.id]?.score || 0) > 0;
            }
            return (formData[studentId][criterion.id].score || 0) > 0;
        }).length;

        return totalCriteria > 0 ? (completedCriteria / totalCriteria) * 100 : 0;
    };

    const getStudentTotalScore = (studentId: string) => {
        return evaluationData.criteria.reduce((total, criterion) => {
            if (isCriterionCommon(criterion.id)) {
                return total + (commonCriteriaData[criterion.id]?.score ?? 0);
            }
            return total + (formData[studentId]?.[criterion.id]?.score ?? 0);
        }, 0);
    };
    const getTotalMaxScore = () => {
        return evaluationData.criteria.reduce((total, criterion) => total + criterion.maxScore, 0);
    };

    const commonCriteria = evaluationData.criteria.filter((c) => isCriterionCommon(c.id));
    const individualCriteria = evaluationData.criteria.filter((c) => !isCriterionCommon(c.id));

    const CircularProgress = ({ percentage, size = 48 }: { percentage: number; size?: number }) => {
        const radius = (size - 4) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        return (
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90" width={size} height={size}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        className="text-muted"
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="text-primary transition-all duration-300"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold">{Math.round(percentage)}%</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Student Evaluations</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setExpandedStudents(
                                new Set(evaluationData.teamMembers.map((m) => m.id))
                            )
                        }
                    >
                        Expand All
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedStudents(new Set())}
                    >
                        Collapse All
                    </Button>
                </div>
            </div>

            {commonCriteria.length > 0 && (
                <Card className="border-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Common Criteria</CardTitle>
                                <CardDescription className="text-sm">
                                    These scores apply to all team members
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {commonCriteria.map((criterion, index) => {
                            const currentScore = commonCriteriaData[criterion.id]?.score || 0;
                            const percentage =
                                criterion.maxScore > 0
                                    ? (currentScore / criterion.maxScore) * 100
                                    : 0;
                            const isComplete = currentScore > 0;

                            return (
                                <div
                                    key={criterion.id}
                                    className="rounded-lg border-2 overflow-hidden"
                                >
                                    <div className="p-4 bg-muted/30 border-b-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <Badge
                                                    variant={isComplete ? "default" : "secondary"}
                                                    className="mt-0.5 shrink-0"
                                                >
                                                    {index + 1}
                                                </Badge>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-base mb-1">
                                                        {criterion.name}
                                                    </h4>
                                                    {criterion.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {criterion.description}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            Common
                                                        </Badge>
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            Max: {criterion.maxScore}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <CircularProgress percentage={percentage} size={52} />
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        <ScoreSlider
                                            score={currentScore}
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
                                                Comments (optional)
                                            </Label>
                                            <Textarea
                                                value={
                                                    commonCriteriaData[criterion.id]?.comment || ""
                                                }
                                                onChange={(e) =>
                                                    updateCommonCriteriaScore(
                                                        criterion.id,
                                                        "comment",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Add your evaluation comments..."
                                                className="min-h-[80px] resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}

            {evaluationData.teamMembers.map((student, studentIndex) => {
                const isExpanded = expandedStudents.has(student.id);
                const progress = getStudentProgress(student.id);
                const totalScore = getStudentTotalScore(student.id);
                const maxScore = getTotalMaxScore();

                return (
                    <Card key={student.id} className="border-2">
                        <CardHeader className="pb-3">
                            <div
                                className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => toggleStudent(student.id)}
                            >
                                <div className="flex items-center gap-3">
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div className="rounded-lg p-2 bg-primary/10">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {student.name}
                                            <Badge variant="outline" className="text-xs">
                                                #{studentIndex + 1}
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            {student.email}
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <CircularProgress percentage={progress} size={52} />
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-primary">
                                            {totalScore}
                                            <span className="text-sm text-muted-foreground font-normal">
                                                {" "}
                                                / {maxScore}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total Score
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <Collapsible open={isExpanded}>
                            <CollapsibleContent>
                                <CardContent className="space-y-3 pt-0">
                                    <Separator className="mb-3" />
                                    {individualCriteria.map((criterion, criterionIndex) => {
                                        const currentScore =
                                            formData[student.id]?.[criterion.id]?.score ?? 0;
                                        const currentComment =
                                            formData[student.id]?.[criterion.id]?.comment ?? "";
                                        const percentage =
                                            criterion.maxScore > 0
                                                ? (currentScore / criterion.maxScore) * 100
                                                : 0;
                                        const isComplete = currentScore > 0;

                                        return (
                                            <div
                                                key={criterion.id}
                                                className="rounded-lg border-2 overflow-hidden"
                                            >
                                                <div className="p-4 bg-muted/30 border-b-2">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <Badge
                                                                variant={
                                                                    isComplete
                                                                        ? "default"
                                                                        : "secondary"
                                                                }
                                                                className="mt-0.5 shrink-0"
                                                            >
                                                                {criterionIndex + 1}
                                                            </Badge>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-base mb-1">
                                                                    {criterion.name}
                                                                </h4>
                                                                {criterion.description && (
                                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                                        {criterion.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap gap-2 mt-2">
                                                                    {criterion.courseSpecific && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            Course Specific
                                                                        </Badge>
                                                                    )}
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className="text-xs"
                                                                    >
                                                                        Max: {criterion.maxScore}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <CircularProgress
                                                            percentage={percentage}
                                                            size={52}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-4">
                                                    <ScoreSlider
                                                        score={currentScore}
                                                        maxScore={criterion.maxScore}
                                                        onChange={(value) =>
                                                            updateScore(
                                                                student.id,
                                                                criterion.id,
                                                                "score",
                                                                value
                                                            )
                                                        }
                                                    />

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium">
                                                            Comments (optional)
                                                        </Label>
                                                        <Textarea
                                                            value={currentComment}
                                                            onChange={(e) =>
                                                                updateScore(
                                                                    student.id,
                                                                    criterion.id,
                                                                    "comment",
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Add your evaluation comments..."
                                                            className="min-h-[80px] resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                );
            })}
        </div>
    );
}
