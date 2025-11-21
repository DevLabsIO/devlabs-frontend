"use client";
import React, { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "@/components/admin/users/user-columns";
import { useUsers } from "@/components/admin/users/hooks/use-users";
import { UserDialog } from "@/components/admin/users/user-dialog";
import { KeycloakSyncDialog } from "@/components/admin/users/keycloak-sync-dialog";
import userQueries from "@/repo/user-queries/user-queries";
import { AssignBatchDialog } from "@/components/admin/users/assign-batch-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import batchQueries from "@/repo/batch-queries/batch-queries";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

function useUsersForDataTable(
    page: number,
    pageSize: number,
    search: string,
    dateRange: { from_date: string; to_date: string },
    sortBy: string,
    sortOrder: string,
    columnFilters?: Record<string, string[]>
) {
    return useUsers(search, page - 1, pageSize, columnFilters, sortBy, sortOrder);
}

useUsersForDataTable.isQueryHook = true;

export default function UsersPage() {
    const queryClient = useQueryClient();
    const { success, error } = useToast();
    const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
    const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);

    const columsWrapper = () => {
        return getColumns();
    };
    const columnFilterOptions = [
        {
            columnId: "role",
            title: "Role",
            options: [
                { label: "Student", value: "STUDENT" },
                { label: "Admin", value: "ADMIN" },
                { label: "Faculty", value: "FACULTY" },
                { label: "Manager", value: "MANAGER" },
            ],
        },
    ];

    const deleteMutation = useMutation<void, Error, (string | number)[]>({
        mutationFn: (userIds) => userQueries.bulkDeleteUsers(userIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            success("Users deleted successfully");
        },
        onError: (err: Error) => {
            const errorMessage =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                err.message ||
                "Failed to delete users";
            error(errorMessage);
        },
    });

    const assignMutation = useMutation<
        void,
        Error,
        { userIds: (string | number)[]; batchId: string }
    >({
        mutationFn: (data) => batchQueries.assignUsersToBatch(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            success("Users assigned successfully");
            setIsAssignDialogOpen(false);
        },
        onError: (err: Error) => {
            const errorMessage =
                (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
                err.message ||
                "Failed to assign users";
            error(errorMessage);
        },
    });

    const handleDelete = (userIds: (string | number)[]): Promise<void> => {
        return deleteMutation.mutateAsync(userIds);
    };

    const handleAssignClick = (userIds: (string | number)[]): Promise<void> => {
        setSelectedUserIds(userIds);
        setIsAssignDialogOpen(true);
        return Promise.resolve();
    };

    const handleAssign = (batchId: string) => {
        assignMutation.mutate({ userIds: selectedUserIds, batchId });
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center pb-3">
                <div>
                    <h1 className="text-2xl font-bold">Users Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage system users and sync with Keycloak
                    </p>
                </div>
                <div className="flex gap-2">
                    <UserDialog />
                    <Button
                        onClick={() => setIsSyncDialogOpen(true)}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Sync from Keycloak
                    </Button>
                </div>
            </div>

            <AssignBatchDialog
                isOpen={isAssignDialogOpen}
                onClose={() => setIsAssignDialogOpen(false)}
                onAssign={handleAssign}
                isAssigning={assignMutation.isPending}
            />
            <KeycloakSyncDialog
                isOpen={isSyncDialogOpen}
                onClose={() => setIsSyncDialogOpen(false)}
                onSyncComplete={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
            />

            <DataTable
                config={{
                    enableUrlState: false,
                    enableDateFilter: false,
                    enableColumnFilters: true,
                    enableAssign: true,
                    enableDelete: false,
                }}
                exportConfig={{
                    entityName: "users",
                    columnMapping: {
                        name: "Name",
                        email: "Email",
                        phoneNumber: "Phone Number",
                        role: "Role",
                        isActive: "Status",
                    },
                    columnWidths: [{ wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 }],
                    headers: ["name", "email", "phoneNumber", "role", "isActive"],
                }}
                getColumns={columsWrapper}
                fetchDataFn={useUsersForDataTable}
                idField="id"
                columnFilterOptions={columnFilterOptions}
                deleteFn={handleDelete}
                assignFn={handleAssignClick}
            />
        </div>
    );
}
