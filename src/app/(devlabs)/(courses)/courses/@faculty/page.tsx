"use client";
import { useState, useEffect } from "react";
import { ViewToggle, ViewMode } from "@/components/data-grid/view-toggle";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataGrid } from "@/components/data-grid/data-grid";
import { GridItem } from "@/components/data-grid/grid-item";
import { Course } from "@/types/entities";
import { getColumns } from "@/components/my-courses/course-columns";
import { useMyCourses } from "@/components/my-courses/hooks/use-mycourses";

function useMyCoursesForDataTable(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string,
) {
  return useMyCourses(
    search,
    page - 1,
    pageSize,
    sortBy,
    sortOrder as "asc" | "desc",
  );
}

useMyCoursesForDataTable.isQueryHook = true;

export default function MyCoursesPage() {
  const [viewmode, setViewMode] = useState<ViewMode>("grid");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("course-view") as ViewMode;
    if ((saved && saved === "table") || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem("course-view", newViewMode);
  };

  const handleView = (course: Course) => {
    router.push(`/courses/${course.id}/projects`);
  };

  const columnsWrapper = () => {
    return getColumns(handleView);
  };

  const renderCourseGrid = (
    course: Course,
    index: number,
    isSelected: boolean,
    onToggleSelect: () => void,
  ) => {
    return (
      <GridItem<Course>
        key={course.id}
        item={course}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onCardClick={handleView}
        fieldConfig={{
          id: "id",
          title: "name",
          description: "description",
          badge: {
            field: "code",
            label: "Course Code: ",
          },
        }}
        entityName="course"
      />
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Courses</h1>
        <div className="flex items-center gap-4">
          <ViewToggle
            view={viewmode}
            onViewChange={handleViewModeChange}
            className="shrink-0"
          />
        </div>
      </div>

      <div>
        {viewmode === "grid" ? (
          <DataGrid
            config={{
              enableUrlState: false,
            }}
            exportConfig={{
              entityName: "courses",
              columnMapping: {
                name: "Course Name",
                code: "Course Code",
                description: "Description",
              },
              columnWidths: [
                { wch: 30 }, // name
                { wch: 15 }, // code
                { wch: 50 }, // description
              ],
              headers: ["name", "code", "description"],
            }}
            getColumns={columnsWrapper}
            renderGridItem={renderCourseGrid}
            fetchDataFn={useMyCoursesForDataTable}
            idField="id"
            gridConfig={{
              columns: { default: 1, md: 2, lg: 3, xl: 4 },
              gap: 6,
            }}
            pageSizeOptions={[12, 24, 36, 48]}
          />
        ) : (
          <DataTable
            config={{
              enableUrlState: false,
              enableExport: true,
              enableDateFilter: false,
            }}
            exportConfig={{
              entityName: "courses",
              columnMapping: {
                name: "Course Name",
                code: "Course Code",
                description: "Description",
              },
              columnWidths: [
                { wch: 30 }, // name
                { wch: 15 }, // code
                { wch: 50 }, // description
              ],
              headers: ["name", "code", "description"],
            }}
            getColumns={columnsWrapper}
            fetchDataFn={useMyCoursesForDataTable}
            idField="id"
            onRowClick={handleView}
          />
        )}
      </div>
    </div>
  );
}
