"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { useBatches } from "@/components/admin/batch/hooks/use-batch";
import { getColumns } from "@/components/admin/batch/batch-column";
import { BatchDialog } from "@/components/admin/batch/batch-dialog";
import { DeleteBatchDialog } from "@/components/admin/batch/delete-batch-dialog";
import { Batch } from "@/types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import batchQueries from "@/repo/batch-queries/batch-queries";
import { useToast } from "@/hooks/use-toast";

function useBatchesForDataTable(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
  columnFilters?: Record<string, string[]>
) {
  return useBatches(
    search,
    page - 1,
    pageSize,
    columnFilters,
    sortBy,
    sortOrder
  );
}

useBatchesForDataTable.isQueryHook = true;

export default function BatchesPage() {
  const [selectedBatch, setSelectedBatch] = useState<Batch | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { success, error } = useToast();

  const { mutate: bulkDelete } = useMutation({
    mutationFn: (batchIds: (string | number)[]) => {
      return batchQueries.deleteBatch(String(batchIds[0]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      success("Batch deleted successfully");
    },
    onError: (err: Error) => {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        err.message ||
        "Failed to delete batch";
      error(errorMessage);
    },
  });

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsEditDialogOpen(true);
  };

  const handleRowClick = (batch: Batch) => {
    router.push(`/batch/${batch.id}`);
  };

  const handleDelete = (batchId: string) => {
    setBatchToDelete(batchId);
    setIsDeleteDialogOpen(true);
  };

  const columnsWrapper = () => {
    return getColumns(handleEdit, handleDelete);
  };

  const columnFilterOptions = [
    {
      columnId: "isActive",
      title: "Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Batches Management</h1>
        <BatchDialog mode="create" />
      </div>

      <div>
        <DataTable
          config={{
            enableUrlState: true,
            enableDateFilter: true,
            enableColumnFilters: true,
            enableDelete: true,
          }}
          exportConfig={{
            entityName: "batches",
            columnMapping: {
              name: "Batch Name",
              graduationYear: "Graduation Year",
              department: "Department",
              section: "Section",
              isActive: "Status",
            },
            columnWidths: [{ wch: 30 }, { wch: 15 }, { wch: 15 }],
            headers: [
              "Batch Name",
              "Graduation Year",
              "Department",
              "Section",
              "Status",
            ],
          }}
          getColumns={columnsWrapper}
          fetchDataFn={useBatchesForDataTable}
          idField="id"
          columnFilterOptions={columnFilterOptions}
          deleteFn={
            bulkDelete as (batchIds: (string | number)[]) => Promise<void>
          }
          onRowClick={handleRowClick}
        />
      </div>

      {selectedBatch && (
        <BatchDialog
          batch={selectedBatch}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedBatch(undefined);
          }}
          mode="edit"
        />
      )}

      {batchToDelete && (
        <DeleteBatchDialog
          batchId={batchToDelete}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setBatchToDelete(null);
          }}
        />
      )}
    </div>
  );
}
