"use client";

import { useState, useMemo } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DownloadIcon,
    Settings,
    Filter,
    FileText,
    Search,
    Check,
    BarChart3,
    Info,
    GripVertical,
    Eye,
} from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import type { ReviewProjectsResponse, BatchFilterInfo, CourseFilterInfo } from "@/types/api";

interface ExportResultsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reviewName: string;
    reviewProjects: ReviewProjectsResponse;
    rubricsInfo?: {
        id: string;
        name: string;
        criteria: {
            id: string;
            name: string;
            description: string;
            maxScore: number;
            isCommon: boolean;
        }[];
    };
    onExport: (config: ExportConfig) => void;
    isLoading?: boolean;
}

export interface ExportConfig {
    fileName: string;
    groupBy: "profile" | "team" | "batch" | "course";
    sortBy: "name" | "profileId" | "teamName" | "score";
    selectedColumns: string[];
    columnNames: Record<string, string>;
    columnDefaultValues: Record<string, string>;
    columnOrder: string[];
    showMarkBreakdown: boolean;
    breakdownCriteria: string[];
    batchIds: string[];
    courseIds: string[];
}

interface ColumnOption {
    id: string;
    label: string;
    defaultName: string;
    category: "basic" | "team" | "scores" | "metadata";
}

const DEFAULT_COLUMNS: ColumnOption[] = [
    {
        id: "profileId",
        label: "Roll Number",
        defaultName: "Roll Number",
        category: "basic",
    },
    {
        id: "studentName",
        label: "Student Name",
        defaultName: "Student Name",
        category: "basic",
    },
    {
        id: "email",
        label: "Email",
        defaultName: "Email Address",
        category: "basic",
    },
    {
        id: "teamName",
        label: "Team Name",
        defaultName: "Team Name",
        category: "team",
    },
    {
        id: "teamId",
        label: "Team ID",
        defaultName: "Team ID",
        category: "team",
    },
    {
        id: "totalScore",
        label: "Total Score",
        defaultName: "Total Score",
        category: "scores",
    },
    {
        id: "maxScore",
        label: "Maximum Possible Score",
        defaultName: "Max Score",
        category: "scores",
    },
    {
        id: "percentage",
        label: "Percentage",
        defaultName: "Percentage (%)",
        category: "scores",
    },
    {
        id: "batchName",
        label: "Batch",
        defaultName: "Batch",
        category: "metadata",
    },
    {
        id: "courseName",
        label: "Course Name",
        defaultName: "Course",
        category: "metadata",
    },
    {
        id: "projectTitle",
        label: "Project Title",
        defaultName: "Project",
        category: "metadata",
    },
];

function SortableColumnItem({
    id,
    name,
    type,
    criteria,
    breakdownCriteria,
}: {
    id: string;
    name: string;
    type: "column" | "breakdown";
    criteria?: Array<{ id: string; name: string }>;
    breakdownCriteria?: string[];
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const breakdownNames =
        criteria && breakdownCriteria
            ? breakdownCriteria
                  .map((criteriaId) => criteria.find((c) => c.id === criteriaId)?.name)
                  .filter(Boolean)
            : [];

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${
                isDragging ? "opacity-50 border-primary" : ""
            }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing shrink-0"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <div className="font-medium text-sm">{name}</div>
                {type === "breakdown" && breakdownNames.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                        {breakdownNames.join(", ")}
                    </div>
                )}
                <div className="text-xs text-muted-foreground">
                    {type === "breakdown" ? "Breakdown Criteria" : "Column"}
                </div>
            </div>
            <Badge variant={type === "breakdown" ? "secondary" : "outline"}>
                {type === "breakdown" ? "Breakdown" : "Column"}
            </Badge>
        </div>
    );
}

export function ExportResultsModal({
    open,
    onOpenChange,
    reviewName,
    reviewProjects,
    rubricsInfo,
    onExport,
    isLoading = false,
}: ExportResultsModalProps) {
    const [fileName, setFileName] = useState(`${reviewName.replace(/\s+/g, "_")}_Results_Export`);
    const [groupBy, setGroupBy] = useState<ExportConfig["groupBy"]>("profile");
    const [sortBy, setSortBy] = useState<ExportConfig["sortBy"]>("profileId");
    const [selectedColumns, setSelectedColumns] = useState<string[]>([
        "profileId",
        "studentName",
        "teamName",
        "totalScore",
    ]);
    const [columnNames, setColumnNames] = useState<Record<string, string>>(
        Object.fromEntries(DEFAULT_COLUMNS.map((col) => [col.id, col.defaultName]))
    );
    const [columnDefaultValues, setColumnDefaultValues] = useState<Record<string, string>>({});
    const [columnOrder, setColumnOrder] = useState<string[]>([
        "profileId",
        "studentName",
        "email",
        "teamName",
        "teamId",
        "batchName",
        "courseName",
        "projectTitle",
        "BREAKDOWN",
        "totalScore",
        "maxScore",
        "percentage",
    ]);
    const [showMarkBreakdown, setShowMarkBreakdown] = useState(false);
    const [breakdownCriteria, setBreakdownCriteria] = useState<string[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const criteria = useMemo(() => {
        return rubricsInfo?.criteria || [];
    }, [rubricsInfo]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const orderedColumns = useMemo(() => {
        const items: Array<{
            id: string;
            name: string;
            type: "column" | "breakdown";
        }> = [];

        columnOrder.forEach((colId) => {
            if (colId === "BREAKDOWN" && showMarkBreakdown && breakdownCriteria.length > 0) {
                items.push({
                    id: "BREAKDOWN",
                    name: `Mark Breakdown (${breakdownCriteria.length} criteria)`,
                    type: "breakdown",
                });
            } else if (selectedColumns.includes(colId)) {
                items.push({
                    id: colId,
                    name: columnNames[colId] || colId,
                    type: "column",
                });
            }
        });

        return items;
    }, [columnOrder, selectedColumns, columnNames, showMarkBreakdown, breakdownCriteria]);

    const batchOptions = useMemo(
        () =>
            reviewProjects.batches.map((batch: BatchFilterInfo) => ({
                label: batch.batchName,
                value: batch.batchId,
            })),
        [reviewProjects.batches]
    );

    const courseOptions = useMemo(
        () =>
            reviewProjects.courses.map((course: CourseFilterInfo) => ({
                label: `${course.courseName} (${course.courseCode})`,
                value: course.courseId,
            })),
        [reviewProjects.courses]
    );

    const columnsByCategory = useMemo(() => {
        const categories: Record<string, ColumnOption[]> = {
            basic: [],
            team: [],
            scores: [],
            metadata: [],
        };

        DEFAULT_COLUMNS.forEach((col) => {
            categories[col.category].push(col);
        });

        return categories;
    }, []);

    const filteredColumnsByCategory = useMemo(() => {
        if (!searchQuery.trim()) return columnsByCategory;

        const filtered: Record<string, ColumnOption[]> = {
            basic: [],
            team: [],
            scores: [],
            metadata: [],
        };

        Object.entries(columnsByCategory).forEach(([category, columns]) => {
            filtered[category] = columns.filter(
                (col) =>
                    col.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    col.defaultName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });

        return filtered;
    }, [columnsByCategory, searchQuery]);

    const toggleColumn = (columnId: string) => {
        setSelectedColumns((prev) =>
            prev.includes(columnId) ? prev.filter((id) => id !== columnId) : [...prev, columnId]
        );
    };

    const toggleAllInCategory = (category: string) => {
        const categoryColumns = columnsByCategory[category].map((col) => col.id);
        const allSelected = categoryColumns.every((id) => selectedColumns.includes(id));

        if (allSelected) {
            setSelectedColumns((prev) => prev.filter((id) => !categoryColumns.includes(id)));
        } else {
            setSelectedColumns((prev) => [...new Set([...prev, ...categoryColumns])]);
        }
    };

    const updateColumnName = (columnId: string, newName: string) => {
        setColumnNames((prev) => ({
            ...prev,
            [columnId]: newName,
        }));
    };

    const updateColumnDefaultValue = (columnId: string, value: string) => {
        setColumnDefaultValues((prev) => ({
            ...prev,
            [columnId]: value,
        }));
    };

    const toggleBreakdownCriteria = (criteriaId: string) => {
        setBreakdownCriteria((prev) =>
            prev.includes(criteriaId)
                ? prev.filter((id) => id !== criteriaId)
                : [...prev, criteriaId]
        );
    };

    const toggleAllBreakdownCriteria = () => {
        const allCriteriaIds = criteria.map((c) => c.id);
        const allSelected = allCriteriaIds.every((id) => breakdownCriteria.includes(id));

        if (allSelected) {
            setBreakdownCriteria([]);
        } else {
            setBreakdownCriteria(allCriteriaIds);
        }
    };

    const resetColumnName = (columnId: string) => {
        const defaultColumn = DEFAULT_COLUMNS.find((col) => col.id === columnId);
        if (defaultColumn) {
            updateColumnName(columnId, defaultColumn.defaultName);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setColumnOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleExport = () => {
        onExport({
            fileName,
            groupBy,
            sortBy,
            selectedColumns,
            columnNames,
            columnDefaultValues,
            columnOrder,
            showMarkBreakdown,
            breakdownCriteria,
            batchIds: selectedBatches,
            courseIds: selectedCourses,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[55vw] min-w-[55vw] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="shrink-0 px-6 pt-6">
                    <DialogTitle className="flex items-center gap-2">
                        <DownloadIcon className="h-5 w-5" />
                        Export Results to Excel
                    </DialogTitle>
                    <DialogDescription>
                        Configure your export settings and select which data to include in the Excel
                        file.
                    </DialogDescription>
                </DialogHeader>

                <TooltipProvider>
                    <div className="flex-1 overflow-y-auto px-6">
                        <div className="space-y-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="fileName" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    File Name
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                The name of the exported Excel file (without .xlsx
                                                extension)
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id="fileName"
                                        value={fileName}
                                        onChange={(e) => setFileName(e.target.value)}
                                        placeholder="Enter file name"
                                        className="flex-1 min-w-0"
                                    />
                                    <Badge
                                        variant="secondary"
                                        className="h-10 items-center px-3 whitespace-nowrap shrink-0"
                                    >
                                        .xlsx
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Data Filters
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Filter which students/teams to include based on
                                                batch or course
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Filter which projects to include in the export
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Batches (Optional)</Label>
                                        <MultiSelectDropdown
                                            options={batchOptions}
                                            selected={selectedBatches}
                                            onChange={setSelectedBatches}
                                            placeholder="All batches"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs">Courses (Optional)</Label>
                                        <MultiSelectDropdown
                                            options={courseOptions}
                                            selected={selectedCourses}
                                            onChange={setSelectedCourses}
                                            placeholder="All courses"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Data Organization
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                Choose how to group and sort the data in your export
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </Label>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Group By</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                            {[
                                                {
                                                    value: "profile",
                                                    label: "Individual Roll Number",
                                                    desc: "Flat list",
                                                },
                                                {
                                                    value: "team",
                                                    label: "Team",
                                                    desc: "Grouped by team",
                                                },
                                                {
                                                    value: "batch",
                                                    label: "Batch",
                                                    desc: "Grouped by batch",
                                                },
                                                {
                                                    value: "course",
                                                    label: "Course",
                                                    desc: "Grouped by course",
                                                },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setGroupBy(
                                                            option.value as ExportConfig["groupBy"]
                                                        )
                                                    }
                                                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left min-w-0 ${
                                                        groupBy === option.value
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                    }`}
                                                >
                                                    <div
                                                        className={`shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                                            groupBy === option.value
                                                                ? "border-primary bg-primary"
                                                                : "border-muted-foreground/30"
                                                        }`}
                                                    >
                                                        {groupBy === option.value && (
                                                            <Check className="h-3 w-3 text-primary-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm truncate">
                                                            {option.label}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {option.desc}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Sort By</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                            {[
                                                {
                                                    value: "name",
                                                    label: "Student Name",
                                                    desc: "Alphabetical A-Z",
                                                },
                                                {
                                                    value: "profileId",
                                                    label: "Roll Number",
                                                    desc: "By roll number",
                                                },
                                                {
                                                    value: "teamName",
                                                    label: "Team Name",
                                                    desc: "Alphabetical A-Z",
                                                },
                                                {
                                                    value: "score",
                                                    label: "Total Score",
                                                    desc: "High to low",
                                                },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setSortBy(
                                                            option.value as ExportConfig["sortBy"]
                                                        )
                                                    }
                                                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left min-w-0 ${
                                                        sortBy === option.value
                                                            ? "border-primary bg-primary/5"
                                                            : "border-border hover:border-primary/50"
                                                    }`}
                                                >
                                                    <div
                                                        className={`shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                                            sortBy === option.value
                                                                ? "border-primary bg-primary"
                                                                : "border-muted-foreground/30"
                                                        }`}
                                                    >
                                                        {sortBy === option.value && (
                                                            <Check className="h-3 w-3 text-primary-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm truncate">
                                                            {option.label}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {option.desc}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2">
                                        Select Columns to Export
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    Choose which data fields to include as columns
                                                    in the Excel file
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Badge variant="secondary">
                                        {selectedColumns.length} selected
                                    </Badge>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search columns..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>

                                {isLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="space-y-3">
                                                <Skeleton className="h-6 w-32" />
                                                <div className="space-y-2 pl-2">
                                                    {[1, 2].map((j) => (
                                                        <Skeleton key={j} className="h-16 w-full" />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {Object.entries(filteredColumnsByCategory).map(
                                            ([category, columns]) => {
                                                if (columns.length === 0) return null;

                                                return (
                                                    <div key={category} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label className="text-sm capitalize">
                                                                {category}
                                                            </Label>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    toggleAllInCategory(category)
                                                                }
                                                                className="h-7 text-xs"
                                                            >
                                                                {columns.every((col) =>
                                                                    selectedColumns.includes(col.id)
                                                                )
                                                                    ? "Deselect All"
                                                                    : "Select All"}
                                                            </Button>
                                                        </div>
                                                        <div className="space-y-2 pl-2">
                                                            {columns.map((column) => (
                                                                <div
                                                                    key={column.id}
                                                                    className="flex items-start gap-3 p-2 rounded-lg border bg-muted/20 min-w-0"
                                                                >
                                                                    <Checkbox
                                                                        id={column.id}
                                                                        checked={selectedColumns.includes(
                                                                            column.id
                                                                        )}
                                                                        onCheckedChange={() =>
                                                                            toggleColumn(column.id)
                                                                        }
                                                                        className="mt-1 shrink-0"
                                                                    />
                                                                    <div className="flex-1 space-y-2 min-w-0">
                                                                        <Label
                                                                            htmlFor={column.id}
                                                                            className="font-normal cursor-pointer block"
                                                                        >
                                                                            {column.label}
                                                                        </Label>
                                                                        {selectedColumns.includes(
                                                                            column.id
                                                                        ) && (
                                                                            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                                                                <Input
                                                                                    value={
                                                                                        columnNames[
                                                                                            column
                                                                                                .id
                                                                                        ]
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        updateColumnName(
                                                                                            column.id,
                                                                                            e.target
                                                                                                .value
                                                                                        )
                                                                                    }
                                                                                    placeholder="Column name in Excel"
                                                                                    className="h-8 text-xs flex-1 min-w-0"
                                                                                />
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        resetColumnName(
                                                                                            column.id
                                                                                        )
                                                                                    }
                                                                                    className="h-8 text-xs whitespace-nowrap shrink-0"
                                                                                >
                                                                                    Reset
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}

                                        {searchQuery &&
                                            Object.values(filteredColumnsByCategory).every(
                                                (cols) => cols.length === 0
                                            ) && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <p>
                                                        No columns found matching &quot;
                                                        {searchQuery}&quot;
                                                    </p>
                                                </div>
                                            )}
                                    </>
                                )}
                            </div>

                            {criteria.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="showMarkBreakdown"
                                                checked={showMarkBreakdown}
                                                onCheckedChange={(checked) => {
                                                    setShowMarkBreakdown(checked as boolean);
                                                    if (checked) {
                                                        const allCriteriaIds = criteria.map(
                                                            (c) => c.id
                                                        );
                                                        setBreakdownCriteria(allCriteriaIds);
                                                    }
                                                }}
                                                className="shrink-0"
                                            />
                                            <div className="flex-1">
                                                <Label
                                                    htmlFor="showMarkBreakdown"
                                                    className="cursor-pointer font-semibold flex items-center gap-2"
                                                >
                                                    <BarChart3 className="h-4 w-4" />
                                                    Show Mark Breakdown
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>
                                                                Creates a detailed breakdown view
                                                                showing how marks are distributed
                                                                across criteria
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Display detailed score breakdown for each
                                                    criterion in the export
                                                </p>
                                            </div>
                                        </div>

                                        {showMarkBreakdown && (
                                            <div className="space-y-3 pl-7 border-l-2 border-primary/20">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm">
                                                        Select Criteria for Breakdown
                                                    </Label>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary">
                                                            {breakdownCriteria.length} /{" "}
                                                            {criteria.length} selected
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={toggleAllBreakdownCriteria}
                                                            className="h-7 text-xs"
                                                        >
                                                            {breakdownCriteria.length ===
                                                            criteria.length
                                                                ? "Deselect All"
                                                                : "Select All"}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {criteria.map((criterion) => (
                                                        <div
                                                            key={`breakdown-${criterion.id}`}
                                                            className="flex items-center gap-3 p-2 rounded-lg border bg-muted/10"
                                                        >
                                                            <Checkbox
                                                                id={`breakdown-${criterion.id}`}
                                                                checked={breakdownCriteria.includes(
                                                                    criterion.id
                                                                )}
                                                                onCheckedChange={() =>
                                                                    toggleBreakdownCriteria(
                                                                        criterion.id
                                                                    )
                                                                }
                                                                className="shrink-0"
                                                            />
                                                            <Label
                                                                htmlFor={`breakdown-${criterion.id}`}
                                                                className="flex-1 cursor-pointer text-sm"
                                                            >
                                                                {criterion.name}
                                                                <span className="text-xs text-muted-foreground ml-2">
                                                                    ({criterion.maxScore} pts)
                                                                </span>
                                                                {criterion.isCommon && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-2 text-xs"
                                                                    >
                                                                        Common
                                                                    </Badge>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {selectedColumns.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                Default Values (Optional)
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Set fallback values to use when data is
                                                            missing or unavailable
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Set default values for columns when data is missing
                                                (default: -)
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            {selectedColumns.map((columnId) => {
                                                const column = DEFAULT_COLUMNS.find(
                                                    (col) => col.id === columnId
                                                );
                                                if (!column) return null;

                                                return (
                                                    <div
                                                        key={`default-${columnId}`}
                                                        className="flex items-center gap-3 p-2 rounded-lg border bg-muted/10"
                                                    >
                                                        <Label className="shrink-0 w-48 text-xs">
                                                            {columnNames[columnId]}
                                                        </Label>
                                                        <Input
                                                            value={
                                                                columnDefaultValues[columnId] || ""
                                                            }
                                                            onChange={(e) =>
                                                                updateColumnDefaultValue(
                                                                    columnId,
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="-"
                                                            className="h-8 text-xs flex-1"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {orderedColumns.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="flex items-center gap-2">
                                                <Eye className="h-4 w-4" />
                                                Column Order Preview
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>
                                                            Drag and drop to reorder columns in the
                                                            Excel export
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Drag to reorder how columns will appear in the
                                                export
                                            </p>
                                        </div>

                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={columnOrder.filter((id) =>
                                                    id === "BREAKDOWN"
                                                        ? showMarkBreakdown &&
                                                          breakdownCriteria.length > 0
                                                        : selectedColumns.includes(id)
                                                )}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2 p-1">
                                                    {orderedColumns.map((item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Badge
                                                                variant="outline"
                                                                className="h-6 w-6 shrink-0 flex items-center justify-center text-xs"
                                                            >
                                                                {index + 1}
                                                            </Badge>
                                                            <SortableColumnItem
                                                                id={item.id}
                                                                name={item.name}
                                                                type={item.type}
                                                                criteria={criteria}
                                                                breakdownCriteria={
                                                                    breakdownCriteria
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </TooltipProvider>

                <DialogFooter className="shrink-0 flex items-center gap-2 px-6 py-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={selectedColumns.length === 0}
                        className="gap-2"
                    >
                        <DownloadIcon className="h-4 w-4" />
                        Export to Excel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
