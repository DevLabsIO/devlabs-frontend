"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useReview } from "@/components/reviews/hooks/use-review";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Info } from "lucide-react";
import { useSessionContext } from "@/lib/session-context";
import { calculateReviewStatus } from "@/lib/utils/review-status";
import type { ReviewProjectsResponse } from "@/types/api";
import type { StudentExportData, CriteriaInfo } from "@/types/api";
import { ReviewHeader } from "@/components/reviews/review-detail/review-header";
import { ReviewProjectsTab } from "@/components/reviews/review-detail/review-projects-tab";
import { ReviewDetailsTab } from "@/components/reviews/review-detail/review-details-tab";
import { ReviewDetailSkeleton } from "@/components/reviews/review-detail/review-detail-skeleton";
import { ReviewErrorState } from "@/components/reviews/review-detail/review-error-state";
import {
    ExportResultsModal,
    type ExportConfig,
} from "@/components/reviews/review-detail/export-results-modal";

export default function ReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.id as string;
    const { session } = useSessionContext();
    const [exportModalOpen, setExportModalOpen] = useState(false);

    const { data: review, isLoading: reviewLoading, error: reviewError } = useReview(reviewId);

    const {
        data: reviewProjects,
        isLoading: projectsLoading,
        error: projectsError,
    } = useQuery<ReviewProjectsResponse>({
        queryKey: ["reviewProjects", reviewId],
        queryFn: () => reviewQueries.getReviewProjects(reviewId),
        enabled: !!reviewId,
    });

    const reviewStatus = useMemo(() => {
        if (!review) return null;
        return calculateReviewStatus(review.startDate, review.endDate);
    }, [review]);

    const canPublish = useMemo(() => {
        if (!session?.user || !review || !reviewStatus) return false;
        if (reviewStatus !== "COMPLETED") return false;
        const userGroups = (session.user.groups ?? []) as string[];
        const ALLOWED_PUBLISH_GROUPS = ["admin", "manager", "faculty"] as const;
        return ALLOWED_PUBLISH_GROUPS.some((g) => userGroups.includes(g));
    }, [session?.user, review, reviewStatus]);

    const handleExport = async (config: ExportConfig) => {
        const toastId = "review-export-toast";

        try {
            const { toast: toastFunc } = await import("sonner");
            const { exportToExcel } = await import("@/components/data-table/utils/export-utils");

            toastFunc.loading("Fetching export data...", {
                description: "Retrieving review results from server...",
                id: toastId,
            });

            const exportData = await reviewQueries.getReviewExportData(
                reviewId,
                config.batchIds,
                config.courseIds
            );

            if (!exportData || exportData.students.length === 0) {
                toastFunc.error("Export failed", {
                    description: "No student data available to export.",
                    id: toastId,
                });
                return;
            }

            toastFunc.loading("Transforming data...", {
                description: `Processing ${exportData.students.length} student records...`,
                id: toastId,
            });

            const exportRows = exportData.students.map((student: StudentExportData) => {
                const baseRow: Record<string, string | number> = {};

                config.selectedColumns.forEach((colId) => {
                    const customName = config.columnNames[colId];
                    const defaultValue = config.columnDefaultValues[colId] || "-";

                    let value: string | number = defaultValue;

                    switch (colId) {
                        case "profileId":
                            value = student.profileId || defaultValue;
                            break;
                        case "studentName":
                            value = student.studentName || defaultValue;
                            break;
                        case "email":
                            value = student.email || defaultValue;
                            break;
                        case "teamName":
                            value = student.teamName || defaultValue;
                            break;
                        case "teamId":
                            value = student.teamId || defaultValue;
                            break;
                        case "totalScore":
                            value = student.totalScore ?? defaultValue;
                            break;
                        case "maxScore":
                            value = student.maxScore ?? defaultValue;
                            break;
                        case "percentage":
                            value = student.percentage
                                ? Number(student.percentage.toFixed(2))
                                : defaultValue;
                            break;
                        case "batchName":
                            value = student.batchNames.join(", ") || defaultValue;
                            break;
                        case "courseName":
                            value = student.courseNames.join(", ") || defaultValue;
                            break;
                        case "projectTitle":
                            value = student.projectTitle || defaultValue;
                            break;
                    }

                    baseRow[customName] = value;
                });

                if (config.showMarkBreakdown && config.breakdownCriteria.length > 0) {
                    config.breakdownCriteria.forEach((criteriaId) => {
                        const criterion = exportData.criteria.find(
                            (c: CriteriaInfo) => c.id === criteriaId
                        );
                        if (criterion) {
                            const scoreData = student.criteriaScores[criteriaId];
                            baseRow[criterion.name] =
                                scoreData?.score ??
                                (config.columnDefaultValues["breakdown"] || "-");
                        }
                    });
                }

                return baseRow;
            });

            let sortedRows = exportRows;
            switch (config.sortBy) {
                case "name":
                    sortedRows = [...exportRows].sort((a, b) => {
                        const nameA = String(a[config.columnNames.studentName] || "");
                        const nameB = String(b[config.columnNames.studentName] || "");
                        return nameA.localeCompare(nameB);
                    });
                    break;
                case "profileId":
                    sortedRows = [...exportRows].sort((a, b) => {
                        const idA = String(a[config.columnNames.profileId] || "");
                        const idB = String(b[config.columnNames.profileId] || "");
                        return idA.localeCompare(idB);
                    });
                    break;
                case "teamName":
                    sortedRows = [...exportRows].sort((a, b) => {
                        const teamA = String(a[config.columnNames.teamName] || "");
                        const teamB = String(b[config.columnNames.teamName] || "");
                        return teamA.localeCompare(teamB);
                    });
                    break;
                case "score":
                    sortedRows = [...exportRows].sort((a, b) => {
                        const scoreA = Number(a[config.columnNames.totalScore] || 0);
                        const scoreB = Number(b[config.columnNames.totalScore] || 0);
                        return scoreB - scoreA;
                    });
                    break;
            }

            const orderedHeaders: string[] = [];
            config.columnOrder.forEach((colId) => {
                if (
                    colId === "BREAKDOWN" &&
                    config.showMarkBreakdown &&
                    config.breakdownCriteria.length > 0
                ) {
                    config.breakdownCriteria.forEach((criteriaId) => {
                        const criterion = exportData.criteria.find(
                            (c: CriteriaInfo) => c.id === criteriaId
                        );
                        if (criterion) {
                            orderedHeaders.push(criterion.name);
                        }
                    });
                } else if (config.selectedColumns.includes(colId)) {
                    orderedHeaders.push(config.columnNames[colId]);
                }
            });

            const columnWidths = orderedHeaders.map((header) => {
                const length = header.length;
                return { wch: Math.max(15, Math.min(50, length + 5)) };
            });

            toastFunc.loading("Generating Excel file...", {
                description: "Creating workbook...",
                id: toastId,
            });

            const success = exportToExcel(
                sortedRows,
                config.fileName,
                Object.fromEntries(orderedHeaders.map((h) => [h, h])),
                columnWidths,
                orderedHeaders
            );

            if (success) {
                toastFunc.success("Export successful", {
                    description: `Exported ${sortedRows.length} student records to Excel.`,
                    id: toastId,
                });
            } else {
                toastFunc.error("Export failed", {
                    description: "Failed to generate Excel file.",
                    id: toastId,
                });
            }
        } catch (error) {
            console.error("Export error:", error);
            const { toast: toastFunc } = await import("sonner");
            toastFunc.error("Export failed", {
                description: "An unexpected error occurred. Please try again.",
                id: toastId,
            });
        }
    };

    if (reviewLoading || projectsLoading) {
        return <ReviewDetailSkeleton />;
    }

    if (reviewError || !review || projectsError || !reviewProjects) {
        return <ReviewErrorState error={reviewError} onBack={() => router.back()} />;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <ReviewHeader
                review={review}
                projectCount={reviewProjects.projects.length}
                reviewStatus={reviewStatus}
                canPublish={canPublish}
                onBack={() => router.back()}
                onExportClick={() => setExportModalOpen(true)}
            />

            <ExportResultsModal
                open={exportModalOpen}
                onOpenChange={setExportModalOpen}
                reviewName={review.name}
                reviewProjects={reviewProjects}
                rubricsInfo={review.rubricsInfo}
                onExport={handleExport}
            />

            <Tabs defaultValue="projects" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="projects" className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        Projects
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Details
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="projects">
                    <ReviewProjectsTab reviewId={reviewId} reviewProjects={reviewProjects} />
                </TabsContent>

                <TabsContent value="details">
                    <ReviewDetailsTab review={review} reviewStatus={reviewStatus} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
