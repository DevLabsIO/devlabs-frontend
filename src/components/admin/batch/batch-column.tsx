import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Batch } from "@/types/types";

function handleDelete(batchId: string) {}

export const getColumns = (
  handleClick?: (batch: Batch) => void
): ColumnDef<Batch>[] => {
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
        <div
          className="flex justify-center p-2"
          onClick={(e) => e.stopPropagation()}
        >
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
        <DataTableColumnHeader
          column={column}
          title="Batch Name"
          className="text-center"
        />
      ),
      cell: ({ row }) => {
        const batch = row.original;
        const name = batch.name as string;

        return (
          <div className="items-center space-x-3">
            <div className="font-medium">{name}</div>
          </div>
        );
      },
      meta: { label: "Batch Name" },
      size: 200,
    },
    {
      accessorKey: "batch",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Batch"
          className="text-center"
        />
      ),
      cell: ({ row }) => {
        const batch = row.getValue("batch") as string;
        return <div className="text-center font-medium">{batch}</div>;
      },
      meta: { label: "Batch" },
      size: 100,
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Department"
          className="text-center"
        />
      ),
      cell: ({ row }) => {
        const department = row.getValue("department") as string;
        return <div className="text-center font-medium">{department}</div>;
      },
      meta: { label: "Department" },
      size: 100,
    },
    {
      accessorKey: "section",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Section"
          className="text-center"
        />
      ),
      cell: ({ row }) => {
        const section = row.getValue("section") as string;
        return <div className="text-center font-medium">{section}</div>;
      },
      meta: { label: "Section" },
      size: 100,
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Status"
          className="text-center"
        />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <div className="text-center">
            <Badge variant={isActive ? "default" : "destructive"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
      meta: { label: "Status" },
      size: 100,
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const batch = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 mx-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Batch
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(batch.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Batch
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
