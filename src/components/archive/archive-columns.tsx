"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, BookOpen } from "lucide-react";
import { Project, ProjectStatus } from "@/types/entities";

const formatDateString = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return dateString;
    }
};

const getStatusBadgeVariant = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.COMPLETED:
            return "default";
        case ProjectStatus.ONGOING:
            return "secondary";
        case ProjectStatus.PROPOSED:
            return "outline";
        case ProjectStatus.REJECTED:
            return "destructive";
        default:
            return "secondary";
    }
};

export const getColumns = (): ColumnDef<Project>[] => [
    {
        accessorKey: "title",
        header: "Project Title",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("title")}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {row.original.description}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as ProjectStatus;
            return (
                <div className="flex justify-center">
                    <Badge variant={getStatusBadgeVariant(status)}>
                        {status === ProjectStatus.ONGOING ? "Live" : status.replace("_", " ")}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "teamMembers",
        header: "Team Members",
        cell: ({ row }) => {
            const teamMembers = row.original.teamMembers || [];
            return (
                <div className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{teamMembers.length}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "courses",
        header: "Courses",
        cell: ({ row }) => {
            const courses = row.original.courses || [];

            if (courses.length === 0) {
                return (
                    <div className="flex items-center justify-center">
                        <span className="text-muted-foreground text-4xl">-</span>
                    </div>
                );
            }

            return (
                <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                        {courses.slice(0, 2).map((course) => (
                            <Badge key={course.id} variant="outline" className="text-xs">
                                {course.code || course.name}
                            </Badge>
                        ))}
                        {courses.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{courses.length - 2}
                            </Badge>
                        )}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Completed On",
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDateString(row.getValue("updatedAt"))}</span>
                </div>
            );
        },
    },
];
