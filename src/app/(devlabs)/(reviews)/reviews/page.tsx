"use client";
import { useState, useEffect } from "react";
import { ViewToggle, ViewMode } from "@/components/data-grid/view-toggle";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataGrid } from "@/components/data-grid/data-grid";
import { GridItem } from "@/components/data-grid/grid-item";
import { Review } from "@/types/entities";
import { Calendar, Clock, PlusCircle } from "lucide-react";
import { getColumns } from "@/components/reviews/review-columns";
import { useReviews } from "@/components/reviews/hooks/use-reviews-table";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useToast } from "@/hooks/use-toast";
import { useSessionContext } from "@/lib/session-context";
import { format } from "date-fns";
import { calculateReviewStatus } from "@/lib/utils/review-status";

function useReviewsForDataTable(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
  courseId?: string,
  status?: string,
) {
  return useReviews(
    search,
    page - 1,
    pageSize,
    sortBy,
    sortOrder as "asc" | "desc",
    courseId,
    status,
  );
}

useReviewsForDataTable.isQueryHook = true;

export default function ReviewsPage() {
  const [viewmode, setViewMode] = useState<ViewMode>("table");
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
    const saved = localStorage.getItem("review-view") as ViewMode;
    if ((saved && saved === "table") || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem("review-view", newViewMode);
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

  const handleCreate = () => {
    router.push("/reviews/create");
  };
  const columnsWrapper = () => {
    return getColumns(handleView, handleEdit, handleDelete);
  };

  const useFilteredReviews = (
    page: number,
    pageSize: number,
    search: string,
    dateRange: { from_date: string; to_date: string },
    sortBy: string,
    sortOrder: string,
  ) => {
    return useReviewsForDataTable(
      page,
      pageSize,
      search,
      dateRange,
      sortBy,
      sortOrder,
      undefined, // courseId - could be added later
      undefined, // statusFilter removed
    );
  };

  useFilteredReviews.isQueryHook = true;
  const renderReviewGrid = (
    review: Review,
    index: number,
    isSelected: boolean,
    onToggleSelect: () => void,
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
        fieldConfig={{
          id: "id",
          title: "name",
          description: "startDate",
          createdAt: "publishedAt",
          badge: {
            field: "status",
            label: "",
            variant: "outline",
            format: () => status,
          },
          stats: [
            {
              field: "isPublished",
              label: "status",
              icon: Calendar,
              format: (value: unknown) => (value ? "Published" : "Draft"),
            },
            {
              field: "endDate",
              label: "ends",
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
            <h1 className="text-2xl font-semibold">Reviews</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Create and manage project reviews and evaluations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Review
          </Button>
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
              entityName: "reviews",
              columnMapping: {
                name: "Review Name",
                status: "Status",
                startDate: "Start Date",
                endDate: "End Date",
                isPublished: "Publication Status",
                "createdBy.name": "Created By Name",
              },
              columnWidths: [
                { wch: 30 }, // name
                { wch: 15 }, // status
                { wch: 15 }, // startDate
                { wch: 15 }, // endDate
                { wch: 20 }, // isPublished
                { wch: 20 }, // createdBy.name
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
            fetchDataFn={useFilteredReviews}
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
              entityName: "reviews",
              columnMapping: {
                name: "Review Name",
                status: "Status",
                startDate: "Start Date",
                endDate: "End Date",
                isPublished: "Publication Status",
                "createdBy.name": "Created By Name",
              },
              columnWidths: [
                { wch: 30 }, // name
                { wch: 15 }, // status
                { wch: 15 }, // startDate
                { wch: 15 }, // endDate
                { wch: 20 }, // isPublished
                { wch: 20 }, // createdBy.name
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
            fetchDataFn={useFilteredReviews}
            idField="id"
            gridConfig={{
              columns: { default: 1, md: 2, lg: 3, xl: 4 },
              gap: 6,
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
