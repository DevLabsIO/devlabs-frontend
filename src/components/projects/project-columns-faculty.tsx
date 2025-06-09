import { Project } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";

export const getColumnsFaculty = (): ColumnDef<Project>[] => {
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
          title="Project"
          className="text-center"
        />
      ),
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="flex flex-col items-center text-center">
            <div className="font-medium text-gray-500">{project.title}</div>
            {project.description && (
              <div className="text-sm text-gray-700 truncate max-w-xs text-center">
                {project.description}
              </div>
            )}
          </div>
        );
      },
      meta: { label: "Project" },
      size: 250,
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Created"
          className="text-center"
        />
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
  ];
};
