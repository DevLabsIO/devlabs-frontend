"use client";
import { useState, useEffect, use } from "react";
import { ViewToggle, ViewMode } from "@/components/data-grid/view-toggle";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataGrid } from "@/components/data-grid/data-grid";
import { GridItem } from "@/components/data-grid/grid-item";
import { Review } from "@/types/entities";
import { Calendar, Clock, CircleDot } from "lucide-react";
import { getColumns } from "@/components/reviews/review-columns";
import { useReviews } from "@/components/reviews/hooks/use-reviews-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useToast } from "@/hooks/use-toast";
import { useSessionContext } from "@/lib/session-context";
import { format } from "date-fns";
import { calculateReviewStatus } from "@/lib/utils/review-status";

export default function CourseReviewsPage({ params }: { params: Promise<{ courseid: string }> }) {
    const { courseid } = use(params);
    const [viewmode, setViewMode] = useState<ViewMode>("grid");
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
    const router = useRouter();
    const queryClient = useQueryClient();
    const { session } = useSessionContext();
    const { success, error: showError } = useToast();

    const deleteMutation = useMutation({
        mutationFn: (data: { reviewId: string; userId: string }) => {
            return reviewQueries.deleteReview(data.reviewId, data.userId);
        },
        onSuccess: () => {
            success("Review deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            setReviewToDelete(null);
        },
        onError: (error) => {
            showError(`Failed to delete review: ${error.message}`);
            setReviewToDelete(null);
        },
    });

    useEffect(() => {
        const saved = localStorage.getItem("course-review-view") as ViewMode;
        if ((saved && saved === "table") || saved === "grid") {
            setViewMode(saved);
        }
    }, []);

    const handleViewModeChange = (newViewMode: ViewMode) => {
        setViewMode(newViewMode);
        localStorage.setItem("course-review-view", newViewMode);
    };

    const handleView = (review: Review) => {
        router.push(`/reviews/${review.id}`);
    };

    const handleDelete = (review: Review) => {
        setReviewToDelete(review);
    };

    const handleEdit = (review: Review) => {
        router.push(`/reviews/${review.id}/edit`);
    };

    const columnsWrapper = () => {
        return getColumns(handleView, handleEdit, handleDelete);
    };

    function useCourseReviews(
        page: number,
        pageSize: number,
        search: string,
        dateRange: { from_date: string; to_date: string },
        sortBy: string,
        sortOrder: string
    ) {
        return useReviews(
            search,
            page - 1,
            pageSize,
            sortBy,
            sortOrder as "asc" | "desc",
            courseid,
            undefined
        );
    }

    useCourseReviews.isQueryHook = true;

    const renderReviewGrid = (
        review: Review,
        index: number,
        isSelected: boolean,
        onToggleSelect: () => void,
        onEdit?: (item: Review) => void,
        onDelete?: (item: Review) => void,
        columnVisibility?: Record<string, boolean>
    ) => {
        const reviewItem = review as Review & Record<string, unknown>;
        const status = calculateReviewStatus(review.startDate, review.endDate);

        return (
            <GridItem<Review & Record<string, unknown>>
                key={review.id}
                item={reviewItem}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
                onCardClick={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                columnVisibility={columnVisibility}
                fieldConfig={{
                    id: "id",
                    title: "name",
                    description: "startDate",
                    createdAt: "publishedAt",
                    updatedAt: "updatedAt",
                    badge: {
                        field: "status",
                        label: "",
                        variant: "outline",
                        format: () => status,
                    },
                    stats: [
                        {
                            field: "isPublished",
                            label: "Status:",
                            icon: CircleDot,
                            format: (value: unknown) => (value ? "Published" : "Draft"),
                        },
                        {
                            field: "endDate",
                            label: "Ends:",
                            icon: Clock,
                            format: (value: unknown) =>
                                value ? format(new Date(value as string), "MMM dd") : "—",
                        },
                    ],
                }}
                entityName="review"
            />
        );
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        <h1 className="text-2xl font-semibold">Course Reviews</h1>
                    </div>
                    <p className="text-muted-foreground text-sm ml-10">
                        Reviews associated with this course
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <ViewToggle
                        view={viewmode}
                        onViewChange={handleViewModeChange}
                        className="shrink-0"
                    />
                </div>
            </div>

            <div>
                {viewmode === "table" ? (
                    <DataTable
                        config={{
                            enableUrlState: false,
                            enableExport: true,
                            enableDateFilter: false,
                        }}
                        exportConfig={{
                            entityName: "course-reviews",
                            columnMapping: {
                                name: "Review Name",
                                status: "Status",
                                startDate: "Start Date",
                                endDate: "End Date",
                                isPublished: "Publication Status",
                                "createdBy.name": "Created By Name",
                            },
                            columnWidths: [
                                { wch: 30 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 20 },
                                { wch: 20 },
                            ],
                            headers: [
                                "name",
                                "status",
                                "startDate",
                                "endDate",
                                "isPublished",
                                "createdBy.name",
                            ],
                        }}
                        getColumns={columnsWrapper}
                        fetchDataFn={useCourseReviews}
                        idField="id"
                        onRowClick={handleView}
                    />
                ) : (
                    <DataGrid
                        config={{
                            enableUrlState: false,
                        }}
                        defaultSort={{
                            sortBy: "startDate",
                            sortOrder: "desc",
                        }}
                        exportConfig={{
                            entityName: "course-reviews",
                            columnMapping: {
                                name: "Review Name",
                                status: "Status",
                                startDate: "Start Date",
                                endDate: "End Date",
                                isPublished: "Publication Status",
                                "createdBy.name": "Created By Name",
                            },
                            columnWidths: [
                                { wch: 30 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 20 },
                                { wch: 20 },
                            ],
                            headers: [
                                "name",
                                "status",
                                "startDate",
                                "endDate",
                                "isPublished",
                                "createdBy.name",
                            ],
                        }}
                        getColumns={columnsWrapper}
                        renderGridItem={renderReviewGrid}
                        fetchDataFn={useCourseReviews}
                        idField="id"
                        gridConfig={{
                            gap: 1.5,
                        }}
                        pageSizeOptions={[12, 24, 36, 48]}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            <DeleteDialog
                isOpen={!!reviewToDelete}
                onClose={() => setReviewToDelete(null)}
                onConfirm={() =>
                    reviewToDelete &&
                    session?.user?.id &&
                    deleteMutation.mutate({
                        reviewId: reviewToDelete.id,
                        userId: session.user.id,
                    })
                }
                title="Delete Review"
                description={`Are you sure you want to delete the review "${reviewToDelete?.name}"? This action cannot be undone.`}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
