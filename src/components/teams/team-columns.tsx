import { Team } from "@/types/entities";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Users, Edit, Trash2, FolderOpen } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const getColumns = (
    onView?: (team: Team) => void,
    onEdit?: (team: Team) => void,
    onDelete?: (team: Team) => void
): ColumnDef<Team>[] => {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <div className="flex justify-center p-2">
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                        className="rounded border-gray-300 cursor-pointer"
                        aria-label="Select all rows"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex justify-center p-2" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                        className="rounded border-gray-300 cursor-pointer"
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Team" className="text-center" />
            ),
            cell: ({ row }) => {
                const team = row.original;
                return (
                    <div className="flex flex-col items-center text-center max-w-full">
                        <div
                            className="font-medium text-gray-500 truncate max-w-full"
                            title={team.name}
                        >
                            {team.name}
                        </div>
                        {team.description && (
                            <div className="text-sm text-gray-700 truncate max-w-xs text-center">
                                {team.description}
                            </div>
                        )}
                    </div>
                );
            },
            meta: { label: "Team" },
            size: 250,
            enableSorting: true,
        },
        {
            accessorKey: "members",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Members" className="text-center" />
            ),
            cell: ({ row }) => {
                const members = row.getValue("members") as Team["members"];
                return (
                    <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-600">
                            {members.length} member{members.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                );
            },
            enableSorting: false,
            meta: { label: "Members" },
        },
        {
            accessorKey: "projectCount",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Projects" className="text-center" />
            ),
            cell: ({ row }) => {
                const projectCount = row.getValue("projectCount") as number;
                return (
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm text-gray-600">{projectCount}</span>
                        <FolderOpen className="h-4 w-4 text-gray-600 mr-1" />
                    </div>
                );
            },
            meta: { label: "Projects" },
            enableSorting: true,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created" className="text-center" />
            ),
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt") as string;
                return (
                    <span className="text-sm text-gray-600 flex justify-center">
                        {new Date(createdAt).toLocaleDateString()}
                    </span>
                );
            },
            meta: { label: "Created" },
            enableSorting: true,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Last Updated"
                    className="text-center"
                />
            ),
            cell: ({ row }) => {
                const updatedAt = row.getValue("updatedAt") as string;
                return (
                    <span className="text-sm text-gray-600 flex justify-center">
                        {new Date(updatedAt).toLocaleDateString()}
                    </span>
                );
            },
            meta: { label: "Last Updated" },
            enableSorting: true,
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const team = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 mx-auto">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView?.(team);
                                }}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                View Team
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(team);
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Team
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(team);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Team
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
            enableSorting: false,
            enableHiding: false,
            meta: { label: "Actions" },
        },
    ];
};
