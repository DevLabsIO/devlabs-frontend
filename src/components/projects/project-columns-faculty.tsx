import { Project } from "@/types/entities";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/column-header";
import { ProjectActions } from "@/components/projects/project-actions";

const getStatusColor = (status: string) => {
    switch (status) {
        case "PROPOSED":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "ONGOING":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "COMPLETED":
            return "bg-green-100 text-green-800 border-green-200";
        case "REJECTED":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

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
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Project" className="text-center" />
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
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" className="text-center" />
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const getDisplayStatus = (status: string) => {
                    if (status === "ONGOING") return "Live";
                    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                };
                return (
                    <div className="flex justify-center">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                status
                            )}`}
                        >
                            {getDisplayStatus(status)}
                        </span>
                    </div>
                );
            },
            meta: { label: "Status" },
            size: 120,
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
            cell: ({ row }) => <ProjectActions project={row.original} />,
            enableSorting: false,
            meta: { label: "Actions" },
        },
    ];
};
