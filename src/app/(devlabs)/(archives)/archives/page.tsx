"use client";
import { useState, useEffect } from "react";
import { ViewToggle, ViewMode } from "@/components/data-grid/view-toggle";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataGrid } from "@/components/data-grid/data-grid";
import { GridItem } from "@/components/data-grid/grid-item";
import { Project } from "@/types/entities";
import { Archive, Users, BookOpen } from "lucide-react";
import { getColumns } from "@/components/archive/archive-columns";
import { useArchives } from "@/components/archive/hooks/use-archives";

function useArchivesForDataTable(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
) {
  return useArchives(
    search,
    page - 1,
    pageSize,
    sortBy,
    sortOrder as "asc" | "desc",
  );
}

useArchivesForDataTable.isQueryHook = true;

export default function ArchivesPage() {
  const [viewmode, setViewMode] = useState<ViewMode>("table");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("archive-view") as ViewMode;
    if ((saved && saved === "table") || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem("archive-view", newViewMode);
  };

  const handleView = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const columnsWrapper = () => {
    return getColumns();
  };

  const renderArchiveGrid = (
    project: Project,
    index: number,
    isSelected: boolean,
    onToggleSelect: () => void,
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
          createdAt: "updatedAt",
          badge: {
            field: "status",
            label: "",
            variant: project.status === "COMPLETED" ? "default" : "secondary",
            format: (value: unknown) => {
              if (typeof value === "string") {
                return value.replace("_", " ");
              }
              return String(value);
            },
          },
          stats: [
            {
              field: "teamMembers",
              label: "member(s)",
              icon: Users,
              format: (value: unknown) =>
                Array.isArray(value) ? value.length : 0,
            },
            {
              field: "courses",
              label: "course(s)",
              icon: BookOpen,
              format: (value: unknown) =>
                Array.isArray(value) ? value.length : 0,
            },
          ],
        }}
        entityName="project"
      />
    );
  };
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Archive className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Archives</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Browse your completed projects
          </p>
        </div>
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
              entityName: "archived-projects",
              columnMapping: {
                title: "Project Title",
                description: "Description",
                status: "Status",
                teamMemberCount: "Team Members",
                courseCount: "Course Count",
                updatedAt: "Completed Date",
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
                "courseCount",
                "updatedAt",
              ],
            }}
            getColumns={columnsWrapper}
            fetchDataFn={useArchivesForDataTable}
            idField="id"
            onRowClick={handleView}
          />
        ) : (
          <DataGrid
            config={{
              enableUrlState: false,
            }}
            exportConfig={{
              entityName: "archived-projects",
              columnMapping: {
                title: "Project Title",
                description: "Description",
                status: "Status",
                teamMemberCount: "Team Members",
                courseCount: "Course Count",
                updatedAt: "Completed Date",
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
                "courseCount",
                "updatedAt",
              ],
            }}
            getColumns={columnsWrapper}
            renderGridItem={renderArchiveGrid}
            fetchDataFn={useArchivesForDataTable}
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
