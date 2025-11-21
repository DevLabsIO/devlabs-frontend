import { toast } from "sonner";
import * as XLSX from "xlsx";

export type ExportableData = Record<string, string | number | boolean | null | undefined>;

function getNestedValue(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== "object") return obj;

    const keys = path.split(".");
    let value: unknown = obj;

    for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
            value = (value as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }

    return value;
}

function computeDerivedField<T extends ExportableData>(item: T, field: string): unknown {
    if (field === "memberCount" && "members" in item) {
        const members = item.members;
        return Array.isArray(members) ? members.length : 0;
    }
    if (field === "teamMemberCount" && "teamMembers" in item) {
        const teamMembers = item.teamMembers;
        return Array.isArray(teamMembers) ? teamMembers.length : 0;
    }
    if (field === "courseCount" && "courses" in item) {
        const courses = item.courses;
        return Array.isArray(courses) ? courses.length : 0;
    }
    if (field === "batchCount" && "batches" in item) {
        const batches = item.batches;
        return Array.isArray(batches) ? batches.length : 0;
    }
    if (field === "studentCount" && "students" in item) {
        const students = item.students;
        return Array.isArray(students) ? students.length : 0;
    }

    return undefined;
}

function valueToString(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") {
        if (value instanceof Date) {
            return value.toISOString();
        }

        if (Array.isArray(value)) {
            return value.map((v) => valueToString(v)).join(", ");
        }

        try {
            return JSON.stringify(value);
        } catch {
            return "[Object]";
        }
    }
    return String(value);
}

function convertToCSV<T extends ExportableData>(
    data: T[],
    headers: string[],
    columnMapping?: Record<string, string>
): string {
    if (data.length === 0) {
        throw new Error("No data to export");
    }

    let csvContent = "";

    if (columnMapping) {
        const headerRow = headers.map((header) => {
            const mappedHeader = columnMapping[header] || header;

            return mappedHeader.includes(",") || mappedHeader.includes('"')
                ? `"${mappedHeader.replace(/"/g, '""')}"`
                : mappedHeader;
        });
        csvContent = `${headerRow.join(",")}\n`;
    } else {
        csvContent = `${headers.join(",")}\n`;
    }

    for (const item of data) {
        const row = headers.map((header) => {
            let value: unknown;

            const computed = computeDerivedField(item, header);
            if (computed !== undefined) {
                value = computed;
            } else if (header.includes(".")) {
                value = getNestedValue(item, header);
            } else {
                value = item[header as keyof T];
            }

            const cellValue = valueToString(value);

            const escapedValue =
                cellValue.includes(",") || cellValue.includes('"')
                    ? `"${cellValue.replace(/"/g, '""')}"`
                    : cellValue;

            return escapedValue;
        });

        csvContent += `${row.join(",")}\n`;
    }

    return csvContent;
}

function downloadFile(blob: Blob, filename: string) {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

export function exportToCSV<T extends ExportableData>(
    data: T[],
    filename: string,
    headers: string[] = Object.keys(data[0] || {}),
    columnMapping?: Record<string, string>
): boolean {
    if (data.length === 0) {
        console.error("No data to export");
        return false;
    }

    try {
        const filteredData = data.map((item) => {
            const filteredItem: Record<string, string | number | boolean | null | undefined> = {};
            for (const header of headers) {
                if (header in item) {
                    filteredItem[header] = item[header];
                }
            }
            return filteredItem;
        });

        const csvContent = convertToCSV(filteredData, headers, columnMapping);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        downloadFile(blob, `${filename}.csv`);
        return true;
    } catch (error) {
        console.error("Error creating CSV:", error);
        return false;
    }
}

export function exportToExcel<T extends ExportableData>(
    data: T[],
    filename: string,
    columnMapping?: Record<string, string>,
    columnWidths?: Array<{ wch: number }>,
    headers?: string[]
): boolean {
    if (data.length === 0) {
        console.error("No data to export");
        return false;
    }

    try {
        const mapping =
            columnMapping ||
            Object.keys(data[0] || {}).reduce(
                (acc, key) => {
                    acc[key] = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
                    return acc;
                },
                {} as Record<string, string>
            );

        const worksheetData = data.map((item) => {
            const row: Record<string, string | number | boolean | null | undefined> = {};

            const columnsToExport = headers || Object.keys(mapping);
            for (const key of columnsToExport) {
                let value: unknown;

                const computed = computeDerivedField(item, key);
                if (computed !== undefined) {
                    value = computed;
                } else if (key.includes(".")) {
                    value = getNestedValue(item, key);
                } else if (key in item) {
                    value = item[key];
                } else {
                    value = undefined;
                }

                if (value !== undefined) {
                    const stringValue = valueToString(value);
                    row[mapping[key]] = stringValue;
                }
            }
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);

        if (columnWidths) {
            worksheet["!cols"] = columnWidths;
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        downloadFile(blob, `${filename}.xlsx`);
        return true;
    } catch (error) {
        console.error("Error creating Excel file:", error);
        return false;
    }
}

export async function exportData<T extends ExportableData>(
    type: "csv" | "excel",
    getData: () => Promise<T[]>,
    onLoadingStart?: () => void,
    onLoadingEnd?: () => void,
    options?: {
        headers?: string[];
        columnMapping?: Record<string, string>;
        columnWidths?: Array<{ wch: number }>;
        entityName?: string;
    }
): Promise<boolean> {
    const TOAST_ID = "export-data-toast";

    try {
        if (onLoadingStart) onLoadingStart();

        toast.loading("Preparing export...", {
            description: "Fetching data for export...",
            id: TOAST_ID,
        });

        const exportData = await getData();

        toast.loading("Processing data...", {
            description: "Generating export file...",
            id: TOAST_ID,
        });

        if (exportData.length === 0) {
            toast.error("Export failed", {
                description: "No data available to export.",
                id: TOAST_ID,
            });
            return false;
        }

        const entityName = options?.entityName || "items";

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${entityName}-export-${timestamp}`;

        let success = false;
        if (type === "csv") {
            success = exportToCSV(exportData, filename, options?.headers, options?.columnMapping);
            if (success) {
                toast.success("Export successful", {
                    description: `Exported ${exportData.length} ${entityName} to CSV.`,
                    id: TOAST_ID,
                });
            }
        } else {
            success = exportToExcel(
                exportData,
                filename,
                options?.columnMapping,
                options?.columnWidths,
                options?.headers
            );
            if (success) {
                toast.success("Export successful", {
                    description: `Exported ${exportData.length} ${entityName} to Excel.`,
                    id: TOAST_ID,
                });
            }
        }

        return success;
    } catch (error) {
        console.error("Error exporting data:", error);

        toast.error("Export failed", {
            description: "There was a problem exporting the data. Please try again.",
            id: TOAST_ID,
        });
        return false;
    } finally {
        if (onLoadingEnd) onLoadingEnd();
    }
}
