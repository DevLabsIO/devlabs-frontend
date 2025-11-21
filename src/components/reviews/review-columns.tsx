import { ColumnDef } from "@tanstack/react-table";
import { Review } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { calculateReviewStatus, getStatusColor, formatStatus } from "@/lib/utils/review-status";

export const getColumns = (
    onView: (review: Review) => void,
    onEdit: (review: Review) => void,
    onDelete: (review: Review) => void
): ColumnDef<Review>[] => [
    {
        accessorKey: "name",
        header: "Review Name",
        cell: ({ row }) => {
            const review = row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{review.name}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const review = row.original;
            const dynamicStatus = calculateReviewStatus(review.startDate, review.endDate);

            return (
                <Badge variant="outline" className={getStatusColor(dynamicStatus)}>
                    {formatStatus(dynamicStatus)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
            const startDate = row.original.startDate;
            return startDate ? format(new Date(startDate), "MMM dd, yyyy") : "—";
        },
    },
    {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => {
            const endDate = row.original.endDate;
            return endDate ? format(new Date(endDate), "MMM dd, yyyy") : "—";
        },
    },
    {
        accessorKey: "isPublished",
        header: "Publication Status",
        cell: ({ row }) => {
            const isPublished = row.original.isPublished;
            return (
                <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Published" : "Not Published"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
            const createdBy = row.original.createdBy;
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{createdBy?.name || "Unknown"}</span>
                    <span className="text-sm text-muted-foreground">{createdBy?.email || "—"}</span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const review = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onView(review);
                            }}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(review);
                            }}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(review);
                            }}
                            className="text-destructive"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
