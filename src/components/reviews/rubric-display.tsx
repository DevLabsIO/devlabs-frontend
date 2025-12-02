"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle } from "lucide-react";
import { RubricCriteriaTable } from "@/components/reviews/rubric-criteria-table";

interface RubricDisplayProps {
    rubric: {
        id: string;
        name: string;
        criteria: Array<{
            id?: string;
            name: string;
            description: string;
            maxScore: number;
            isCommon: boolean;
        }>;
    } | null;
}

export function RubricDisplay({ rubric }: RubricDisplayProps) {
    if (!rubric) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Rubrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p>No rubric assigned to this review.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalScore = rubric.criteria.reduce(
        (total, criterion) => total + (criterion.maxScore || 0),
        0
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Rubrics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-2">
                        <h4 className="font-medium text-lg truncate" title={rubric.name}>
                            {rubric.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            {rubric.criteria.length} criteria • Total: {totalScore} points
                        </p>
                    </div>
                    <Badge variant="outline">{rubric.criteria.length} criteria</Badge>
                </div>

                <div className="space-y-4">
                    {rubric.criteria.length > 0 ? (
                        <RubricCriteriaTable
                            criteria={rubric.criteria}
                            onCriteriaChange={() => {}}
                            isReadOnly={true}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground p-4 border-dashed border-2 rounded-lg">
                            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p>This rubric has no criteria defined.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
