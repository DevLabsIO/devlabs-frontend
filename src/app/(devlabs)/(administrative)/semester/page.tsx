"use client";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "@/components/admin/semesters/semester-columns";
import { Semester } from "@/types/entities";
import { SemesterHeader } from "@/components/admin/semesters/semester-header";
import { SemesterAlerts } from "@/components/admin/semesters/semester-alerts";
import { SemesterDialogs } from "@/components/admin/semesters/semester-dialogs";
import { useSemestersForDataTable } from "@/components/admin/semesters/hook/use-semesters-for-data-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import semesterQueries from "@/repo/semester-queries/semester-queries";

export default function SemesterPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [selectedSemester, setSelectedSemester] = React.useState<Semester | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [semesterToDelete, setSemesterToDelete] = React.useState<Semester | null>(null);

    const queryClient = useQueryClient();

    const createSemester = useMutation({
        mutationFn: (semester: Omit<Semester, "id">) => {
            return semesterQueries.createSemester(semester);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["semesters"] });
            success("Semester created successfully");
        },
        onError: (err: Error) => {
            const errorMessage =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                err.message ||
                "Failed to create semester";
            error(errorMessage);
        },
    });

    const updateSemester = useMutation({
        mutationFn: (semester: Semester) => {
            return semesterQueries.updateSemester(semester);
        },
        onSuccess: (data: Semester) => {
            queryClient.invalidateQueries({ queryKey: ["semesters"] });
            queryClient.invalidateQueries({ queryKey: ["semester", data.id] });
            success("Semester updated successfully");
        },
        onError: (err: Error) => {
            const errorMessage =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                err.message ||
                "Failed to update semester";
            error(errorMessage);
        },
    });

    const deleteSemester = useMutation({
        mutationFn: (id: string) => {
            return semesterQueries.deleteSemester(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["semesters"] });
            success("Semester deleted successfully");
        },
        onError: (err: Error) => {
            const errorMessage =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                (err as { response?: { data?: string } }).response?.data ||
                err.message ||
                "Failed to delete semester";
            error(errorMessage);
        },
    });

    const handleAction = (semester: Semester, action: string) => {
        switch (action) {
            case "edit":
                setSelectedSemester(semester);
                setIsEditDialogOpen(true);
                break;
            case "delete":
                setSemesterToDelete(semester);
                setIsDeleteDialogOpen(true);
                break;
        }
    };

    const handleRowClick = (semester: Semester) => {
        router.push(`/semester/${semester.id}/courses`);
    };

    const handleCreateSemester = async (data: Omit<Semester, "id">) => {
        await createSemester.mutateAsync(data);
        setIsCreateDialogOpen(false);
    };

    const handleUpdateSemester = async (data: Omit<Semester, "id">) => {
        if (!selectedSemester) return;
        await updateSemester.mutateAsync({
            id: selectedSemester.id,
            name: data.name as string,
            year: data.year as number,
            isActive: data.isActive as boolean,
        });
        setIsEditDialogOpen(false);
        setSelectedSemester(null);
    };

    const handleDeleteSemester = async () => {
        if (!semesterToDelete) return;
        await deleteSemester.mutateAsync(semesterToDelete.id);
        setIsDeleteDialogOpen(false);
        setSemesterToDelete(null);
    };

    return (
        <div className="container mx-auto py-10">
            <SemesterHeader
                isCreateDialogOpen={isCreateDialogOpen}
                setIsCreateDialogOpen={setIsCreateDialogOpen}
                onCreateSemester={handleCreateSemester}
            />

            <SemesterAlerts
                isCreating={createSemester.isPending}
                isUpdating={updateSemester.isPending}
                isDeleting={deleteSemester.isPending}
                hasCreateError={!!createSemester.error}
                hasUpdateError={!!updateSemester.error}
                hasDeleteError={!!deleteSemester.error}
            />

            <DataTable<Semester, unknown>
                config={{
                    enableUrlState: true,
                    enableDateFilter: true,
                    enableColumnFilters: true,
                    enableColumnVisibility: true,
                    enableExport: true,
                    enablePagination: true,
                    enableSearch: true,
                    enableToolbar: true,
                    size: "default",
                }}
                getColumns={() => getColumns(handleAction)}
                fetchDataFn={useSemestersForDataTable}
                idField="id"
                onRowClick={handleRowClick}
                exportConfig={{
                    entityName: "semesters",
                    columnMapping: {
                        name: "Semester Name",
                        year: "Year",
                        isActive: "Status",
                    },
                    columnWidths: [{ wch: 30 }, { wch: 15 }, { wch: 15 }],
                    headers: ["name", "year", "isActive"],
                }}
                columnFilterOptions={[
                    {
                        columnId: "isActive",
                        title: "Status",
                        options: [
                            { label: "Active", value: "true" },
                            { label: "Inactive", value: "false" },
                        ],
                    },
                ]}
            />

            <SemesterDialogs
                selectedSemester={selectedSemester}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                semesterToDelete={semesterToDelete}
                isDeleting={deleteSemester.isPending}
                onUpdateSemester={handleUpdateSemester}
                onDeleteSemester={handleDeleteSemester}
            />
        </div>
    );
}
