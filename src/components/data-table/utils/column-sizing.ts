import { ColumnDef } from "@tanstack/react-table";

export function extractDefaultColumnSizes<TData>(
  columns: ColumnDef<TData, unknown>[],
): Record<string, number> {
  const defaultSizing: Record<string, number> = {};

  columns.forEach((column) => {
    if (
      "id" in column &&
      column.id &&
      "size" in column &&
      typeof column.size === "number"
    ) {
      defaultSizing[column.id] = column.size;
    } else if (
      "accessorKey" in column &&
      typeof column.accessorKey === "string" &&
      "size" in column &&
      typeof column.size === "number"
    ) {
      defaultSizing[column.accessorKey] = column.size;
    }
  });

  return defaultSizing;
}

export function initializeColumnSizes<TData>(
  columns: ColumnDef<TData, unknown>[],
  setColumnSizing: (sizes: Record<string, number>) => void,
): void {
  if (columns.length === 0) return;

  const defaultSizing = extractDefaultColumnSizes(columns);

  if (Object.keys(defaultSizing).length === 0) return;

  setColumnSizing(defaultSizing);
}

export function trackColumnResizing(
  isResizing: boolean,
  attribute = "data-resizing",
): void {
  if (isResizing) {
    document.body.setAttribute(attribute, "true");
  } else {
    document.body.removeAttribute(attribute);
  }
}

export function cleanupColumnResizing(attribute = "data-resizing"): void {
  document.body.removeAttribute(attribute);
}
