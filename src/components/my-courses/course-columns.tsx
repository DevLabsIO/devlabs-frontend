import { Course } from "@/types/entities";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const getColumns = (onView?: (course: Course) => void): ColumnDef<Course>[] => {
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
                <DataTableColumnHeader column={column} title="Course" className="text-center" />
            ),
            cell: ({ row }) => {
                const course = row.original;
                return (
                    <div className="flex flex-col items-center text-center">
                        <div className="font-medium text-gray-500">{course.name}</div>
                        {course.description && (
                            <div className="text-sm text-gray-700 truncate max-w-xs text-center">
                                {course.description}
                            </div>
                        )}
                    </div>
                );
            },
            meta: { label: "Course" },
            size: 200,
            enableSorting: true,
        },
        {
            accessorKey: "code",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Course Code"
                    className="text-center"
                />
            ),
            cell: ({ row }) => {
                const code = row.getValue("code") as string;
                return <span className="text-sm text-gray-600 flex justify-center">{code}</span>;
            },
            meta: { label: "Course Code" },
            enableSorting: true,
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const course = row.original;
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
                                    onView?.(course);
                                }}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View Course
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
