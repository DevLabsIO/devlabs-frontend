"use client";
import React, { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useDepartments } from "@/components/admin/department/hooks/use-department";
import { getColumns } from "@/components/admin/department/department-column";
import { DepartmentDialog } from "@/components/admin/department/department-dialog";
import { DeleteDepartmentDialog } from "@/components/admin/department/delete-department-dialog";
import { Department } from "@/types/entities";

function useDepartmentsForDataTable(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
  columnFilters?: Record<string, string[]>,
) {
  return useDepartments(
    search,
    page - 1,
    pageSize,
    columnFilters,
    sortBy,
    sortOrder as "asc" | "desc",
  );
}

useDepartmentsForDataTable.isQueryHook = true;

export default function DepartmentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(
    null,
  );

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (departmentId: string) => {
    setDepartmentToDelete(departmentId);
    setIsDeleteDialogOpen(true);
  };

  const columnsWrapper = () => {
    return getColumns(handleEdit, handleDelete);
  };

  return (
    <div>
      <div className="flex justify-between items-center pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Departments Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage academic departments and their configurations
          </p>
        </div>
        <DepartmentDialog mode="create" />
      </div>

      <div>
        <DataTable
          config={{
            enableUrlState: true,
            enableDateFilter: false,
            enableColumnFilters: false,
          }}
          exportConfig={{
            entityName: "departments",
            columnMapping: {
              name: "Department Name",
              batchCount: "Number of Batches",
            },
            columnWidths: [
              { wch: 35 }, // name
              { wch: 20 }, // batchCount
            ],
            headers: ["name", "batchCount"],
          }}
          getColumns={columnsWrapper}
          fetchDataFn={useDepartmentsForDataTable}
          idField="id"
        />
      </div>

      {selectedDepartment && (
        <DepartmentDialog
          department={selectedDepartment}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedDepartment(undefined);
          }}
          mode="edit"
        />
      )}

      {departmentToDelete && (
        <DeleteDepartmentDialog
          departmentId={departmentToDelete}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDepartmentToDelete(null);
          }}
        />
      )}
    </div>
  );
}
