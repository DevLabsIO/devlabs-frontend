"use client";
import { useProjectsByCourse } from "@/components/projects/hooks/use-projects-by-course";
import { ViewMode } from "@/components/data-grid/view-toggle";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Project } from "@/types/entities";
import { getColumnsFaculty } from "@/components/projects/project-columns-faculty";
import { GridItem } from "@/components/data-grid/grid-item";
import { Users } from "lucide-react";
import { ViewToggle } from "@/components/data-grid/view-toggle";
import { DataTable } from "@/components/data-table/data-table";
import { DataGrid } from "@/components/data-grid/data-grid";

export default function CourseProjects() {
    const [viewmode, setViewmode] = useState<ViewMode>("table");
    const router = useRouter();
    const params = useParams();

    function useProjectsForDataTable(
        page: number,
        pageSize: number,
        search: string,
        _dateRange: { from_date: string; to_date: string },
        sortBy: string,
        sortOrder: string
    ) {
        const courseId = params.courseid as string;
        return useProjectsByCourse(
            courseId,
            search,
            page - 1,
            pageSize,
            sortBy,
            sortOrder as "asc" | "desc"
        );
    }

    useProjectsForDataTable.isQueryHook = true;

    useEffect(() => {
        const saved = localStorage.getItem("course-project-view") as ViewMode;
        if ((saved && saved === "table") || saved === "grid") {
            setViewmode(saved);
        }
    }, []);

    const handleViewModeChange = (newViewMode: ViewMode) => {
        setViewmode(newViewMode);
        localStorage.setItem("course-project-view", newViewMode);
    };

    const handleView = (project: Project) => {
        router.push(`/projects/${project.id}`);
    };

    const columnsWrapper = () => {
        return getColumnsFaculty();
    };

    const renderTeamGrid = (
        project: Project,
        index: number,
        isSelected: boolean,
        onToggleSelect: () => void
    ) => {
        return (
            <GridItem<Project>
                key={project.id}
                item={project}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
                onCardClick={handleView}
                fieldConfig={{
                    id: "id",
                    title: "title",
                    description: "description",
                    createdAt: "createdAt",
                    badge: {
                        field: "status",
                        label: "",
                        variant: "secondary",
                    },
                    stats: [
                        {
                            field: "teamMembers",
                            label: "member(s)",
                            icon: Users,
                            format: (value: unknown) => (Array.isArray(value) ? value.length : 0),
                        },
                    ],
                }}
                entityName="project"
            />
        );
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Projects</h1>
                <div className="flex items-center gap-4">
                    <ViewToggle
                        view={viewmode}
                        onViewChange={handleViewModeChange}
                        className="shrink-0"
                    />
                </div>
            </div>

            <div>
                {viewmode === "table" ? (
                    <DataTable
                        config={{
                            enableUrlState: false,
                            enableExport: true,
                            enableDateFilter: false,
                        }}
                        exportConfig={{
                            entityName: "projects",
                            columnMapping: {
                                title: "Project Title",
                                description: "Description",
                                status: "Status",
                                teamMemberCount: "Team Members",
                                createdAt: "Created Date",
                                updatedAt: "Last Updated",
                            },
                            columnWidths: [
                                { wch: 30 },
                                { wch: 50 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 15 },
                            ],
                            headers: [
                                "title",
                                "description",
                                "status",
                                "teamMemberCount",
                                "createdAt",
                                "updatedAt",
                            ],
                        }}
                        defaultSort={{ sortBy: "created_at", sortOrder: "desc" }}
                        getColumns={columnsWrapper}
                        fetchDataFn={useProjectsForDataTable}
                        idField="id"
                        onRowClick={handleView}
                    />
                ) : (
                    <DataGrid
                        config={{
                            enableUrlState: false,
                        }}
                        defaultSort={{ sortBy: "created_at", sortOrder: "desc" }}
                        exportConfig={{
                            entityName: "projects",
                            columnMapping: {
                                title: "Project Title",
                                description: "Description",
                                status: "Status",
                                teamMemberCount: "Team Members",
                                createdAt: "Created Date",
                                updatedAt: "Last Updated",
                            },
                            columnWidths: [
                                { wch: 30 },
                                { wch: 50 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 15 },
                                { wch: 15 },
                            ],
                            headers: [
                                "title",
                                "description",
                                "status",
                                "teamMemberCount",
                                "createdAt",
                                "updatedAt",
                            ],
                        }}
                        getColumns={columnsWrapper}
                        renderGridItem={renderTeamGrid}
                        fetchDataFn={useProjectsForDataTable}
                        idField="id"
                        gridConfig={{
                            columns: { default: 1, md: 2, lg: 3, xl: 4 },
                            gap: 6,
                        }}
                        pageSizeOptions={[12, 24, 36, 48]}
                    />
                )}
            </div>
        </div>
    );
}
