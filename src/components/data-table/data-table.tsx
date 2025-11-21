"use client";

import type * as React from "react";
import {
    type ColumnSizingState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnResizeMode,
} from "@tanstack/react-table";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTableConfig, type TableConfig } from "@/components/data-table/utils/table-config";
import { DataTableResizer } from "./data-table-resizer";
import { preprocessSearch } from "@/components/data-table/utils/search";
import {
    createSortingHandler,
    createColumnFiltersHandler,
    createColumnVisibilityHandler,
    createSortingState,
} from "@/components/data-table/utils/table-state-handlers";
import { createConditionalStateHook } from "@/components/data-table/utils/conditional-state";

interface DataFetchParams {
    page: number;
    limit: number;
    search: string;
    from_date: string;
    to_date: string;
    sort_by: string;
    sort_order: string;
    column_filters?: Record<string, string[]>;
}

interface DataFetchResult<TData> {
    success: boolean;
    data: TData[];
    pagination: {
        page: number;
        limit: number;
        total_pages: number;
        total_items: number;
    };
}

type PaginationUpdater = (prev: { pageIndex: number; pageSize: number }) => {
    pageIndex: number;
    pageSize: number;
};
type ColumnOrderUpdater = (prev: string[]) => string[];
type RowSelectionUpdater = (prev: Record<string, boolean>) => Record<string, boolean>;

interface DataTableProps<TData, TValue> {
    config?: Partial<TableConfig>;

    getColumns: (
        handleRowDeselection: ((rowId: string) => void) | null | undefined
    ) => ColumnDef<TData, TValue>[];

    fetchDataFn:
        | ((params: DataFetchParams) => Promise<DataFetchResult<TData>>)
        | ((
              page: number,
              pageSize: number,
              search: string,
              dateRange: { from_date: string; to_date: string },
              sortBy: string,
              sortOrder: string
          ) => unknown);

    exportConfig: {
        entityName: string;
        columnMapping: Record<string, string>;
        columnWidths: Array<{ wch: number }>;
        headers: string[];
    };

    idField: keyof TData;

    pageSizeOptions?: number[];

    renderToolbarContent?: (props: {
        selectedRows: TData[];
        allSelectedIds: (string | number)[];
        totalSelectedCount: number;
        resetSelection: () => void;
    }) => React.ReactNode;
    columnFilterOptions?: Array<{
        columnId: string;
        title: string;
        options: Array<{
            label: string;
            value: string;
            icon?: React.ComponentType<{ className?: string }>;
        }>;
    }>;

    onRowClick?: (data: TData) => void;

    deleteFn?: (ids: (string | number)[]) => Promise<unknown>;
    assignFn?: (ids: (string | number)[]) => Promise<unknown>;
}

export function DataTable<TData, TValue>({
    config = {},
    getColumns,
    fetchDataFn,
    exportConfig,
    idField = "id" as keyof TData,
    pageSizeOptions,
    renderToolbarContent,
    columnFilterOptions,
    onRowClick,
    deleteFn,
    assignFn,
}: DataTableProps<TData, TValue>) {
    const tableConfig = useTableConfig(config);

    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

    const useConditionalUrlState = createConditionalStateHook(tableConfig.enableUrlState);

    const [page, setPage] = useConditionalUrlState("page", 1);
    const [pageSize, setPageSize] = useConditionalUrlState("pageSize", 10);
    const [search, setSearch] = useConditionalUrlState("search", "");
    const [dateRange, setDateRange] = useConditionalUrlState<{
        from_date: string;
        to_date: string;
    }>("dateRange", { from_date: "", to_date: "" });
    const [sortBy, setSortBy] = useConditionalUrlState("sortBy", "");
    const [sortOrder, setSortOrder] = useConditionalUrlState<"asc" | "desc">("sortOrder", "asc");
    const [columnVisibility, setColumnVisibility] = useConditionalUrlState<Record<string, boolean>>(
        "columnVisibility",
        {}
    );
    const [columnFilters, setColumnFilters] = useConditionalUrlState<
        Array<{ id: string; value: unknown }>
    >("columnFilters", []);

    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<{
        data: TData[];
        pagination: {
            page: number;
            limit: number;
            total_pages: number;
            total_items: number;
        };
    } | null>(null);

    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [selectedItemIds, setSelectedItemIds] = useState<Record<string | number, boolean>>({});

    const sorting = useMemo(() => createSortingState(sortBy, sortOrder), [sortBy, sortOrder]);

    const serverColumnFilters = useMemo(() => {
        const filters: Record<string, string[]> = {};
        columnFilters.forEach((filter) => {
            if (filter.value && Array.isArray(filter.value) && filter.value.length > 0) {
                filters[filter.id] = filter.value as string[];
            }
        });
        return Object.keys(filters).length > 0 ? filters : undefined;
    }, [columnFilters]);

    const dataItems = useMemo(() => data?.data || [], [data?.data]);

    const rowSelection = useMemo(() => {
        if (!dataItems.length) return {};

        const selection: Record<string, boolean> = {};

        dataItems.forEach((item, index) => {
            const itemId = String(item[idField]);
            if (selectedItemIds[itemId]) {
                selection[String(index)] = true;
            }
        });

        return selection;
    }, [dataItems, selectedItemIds, idField]);

    const totalSelectedItems = useMemo(
        () => Object.keys(selectedItemIds).length,
        [selectedItemIds]
    );

    const handleRowDeselection = useCallback(
        (rowId: string) => {
            if (!dataItems.length) return;

            const rowIndex = Number.parseInt(rowId, 10);
            const item = dataItems[rowIndex];

            if (item) {
                const itemId = String(item[idField]);
                setSelectedItemIds((prev) => {
                    const next = { ...prev };
                    delete next[itemId];
                    return next;
                });
            }
        },
        [dataItems, idField]
    );

    const clearAllSelections = useCallback(() => {
        setSelectedItemIds({});
    }, []);

    const handleRowSelectionChange = useCallback(
        (updaterOrValue: RowSelectionUpdater | Record<string, boolean>) => {
            const newRowSelection =
                typeof updaterOrValue === "function"
                    ? updaterOrValue(rowSelection)
                    : updaterOrValue;

            setSelectedItemIds((prev) => {
                const next = { ...prev };

                if (dataItems.length) {
                    for (const [rowId, isSelected] of Object.entries(newRowSelection)) {
                        const rowIndex = Number.parseInt(rowId, 10);
                        if (rowIndex >= 0 && rowIndex < dataItems.length) {
                            const item = dataItems[rowIndex];
                            const itemId = String(item[idField]);

                            if (isSelected) {
                                next[itemId] = true;
                            } else {
                                delete next[itemId];
                            }
                        }
                    }

                    dataItems.forEach((item, index) => {
                        const itemId = String(item[idField]);
                        const rowId = String(index);

                        if (prev[itemId] && newRowSelection[rowId] === undefined) {
                            delete next[itemId];
                        }
                    });
                }

                return next;
            });
        },
        [dataItems, rowSelection, idField]
    );

    useEffect(() => {
        const isQueryHook = (fetchDataFn as { isQueryHook?: boolean }).isQueryHook === true;

        if (!isQueryHook) {
            const currentSortBy = sortBy;
            const currentSortOrder = sortOrder;

            const fetchData = async () => {
                try {
                    setIsLoading(true);
                    const result = await (
                        fetchDataFn as (params: DataFetchParams) => Promise<DataFetchResult<TData>>
                    )({
                        page,
                        limit: pageSize,
                        search: preprocessSearch(search),
                        from_date: dateRange.from_date,
                        to_date: dateRange.to_date,
                        sort_by: currentSortBy,
                        sort_order: currentSortOrder,
                        column_filters: serverColumnFilters,
                    });
                    setData(result);
                    setIsError(false);
                    setError(null);
                } catch (err) {
                    setIsError(true);
                    setError(err instanceof Error ? err : new Error("Unknown error"));
                    console.error("Error fetching data:", err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [page, pageSize, search, dateRange, sortBy, sortOrder, serverColumnFilters, fetchDataFn]);
    const queryResult =
        (fetchDataFn as { isQueryHook?: boolean }).isQueryHook === true
            ? (
                  fetchDataFn as (
                      page: number,
                      pageSize: number,
                      search: string,
                      dateRange: { from_date: string; to_date: string },
                      sortBy: string,
                      sortOrder: string,
                      columnFilters?: Record<string, string[]>
                  ) => {
                      isLoading: boolean;
                      isSuccess: boolean;
                      isError: boolean;
                      data?: DataFetchResult<TData>;
                      error?: Error;
                  }
              )(page, pageSize, search, dateRange, sortBy, sortOrder, serverColumnFilters)
            : null;

    useEffect(() => {
        if (queryResult) {
            setIsLoading(queryResult.isLoading);
            if (queryResult.isSuccess && queryResult.data) {
                setData(queryResult.data);
                setIsError(false);
                setError(null);
            }
            if (queryResult.isError) {
                setIsError(true);
                setError(
                    queryResult.error instanceof Error
                        ? queryResult.error
                        : new Error("Unknown error")
                );
            }
        }
    }, [queryResult]);

    const pagination = useMemo(
        () => ({
            pageIndex: page - 1,
            pageSize,
        }),
        [page, pageSize]
    );

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const columns = useMemo(() => {
        return getColumns(tableConfig.enableRowSelection ? handleRowDeselection : null);
    }, [getColumns, handleRowDeselection, tableConfig.enableRowSelection]);

    const handleColumnFiltersChange = useCallback(
        (
            updaterOrValue:
                | import("@tanstack/react-table").ColumnFiltersState
                | import("@tanstack/react-table").Updater<
                      import("@tanstack/react-table").ColumnFiltersState
                  >
        ) => {
            const handler = createColumnFiltersHandler(setColumnFilters);
            return handler(updaterOrValue);
        },
        [setColumnFilters]
    );
    const handleColumnVisibilityChange = useCallback(
        (
            updaterOrValue:
                | import("@tanstack/react-table").VisibilityState
                | import("@tanstack/react-table").Updater<
                      import("@tanstack/react-table").VisibilityState
                  >
        ) => {
            const handler = createColumnVisibilityHandler(setColumnVisibility);
            return handler(updaterOrValue);
        },
        [setColumnVisibility]
    );

    const handleSortingChange = useCallback(
        (
            updaterOrValue:
                | import("@tanstack/react-table").SortingState
                | import("@tanstack/react-table").Updater<
                      import("@tanstack/react-table").SortingState
                  >
        ) => {
            const handler = createSortingHandler(setSortBy, setSortOrder, sorting);
            return handler(updaterOrValue);
        },
        [setSortBy, setSortOrder, sorting]
    );
    const handlePaginationChange = useCallback(
        (updaterOrValue: PaginationUpdater | { pageIndex: number; pageSize: number }) => {
            const newPagination =
                typeof updaterOrValue === "function"
                    ? updaterOrValue({ pageIndex: page - 1, pageSize })
                    : updaterOrValue;

            if (newPagination.pageSize !== pageSize) {
                Promise.all([setPageSize(newPagination.pageSize), setPage(1)]).catch(console.error);

                return;
            }

            if (newPagination.pageIndex + 1 !== page) {
                const setPagePromise = setPage(newPagination.pageIndex + 1);
                if (setPagePromise && typeof setPagePromise.catch === "function") {
                    setPagePromise.catch((err) => {
                        console.error("Failed to update page param:", err);
                    });
                }
            }
        },
        [page, pageSize, setPage, setPageSize]
    );
    const handleColumnSizingChange = useCallback(
        (updaterOrValue: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
            if (typeof updaterOrValue === "function") {
                setColumnSizing((current) => updaterOrValue(current));
            } else {
                setColumnSizing(updaterOrValue);
            }
        },
        [setColumnSizing]
    );

    const handleColumnOrderChange = useCallback(
        (updaterOrValue: ColumnOrderUpdater | string[]) => {
            const newColumnOrder =
                typeof updaterOrValue === "function" ? updaterOrValue(columnOrder) : updaterOrValue;

            setColumnOrder(newColumnOrder);
        },
        [columnOrder]
    );

    const table = useReactTable<TData>({
        data: dataItems,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
            columnSizing,
            columnOrder,
        },
        columnResizeMode: "onChange" as ColumnResizeMode,
        onColumnSizingChange: handleColumnSizingChange,
        onColumnOrderChange: handleColumnOrderChange,
        pageCount: data?.pagination?.total_pages || 0,
        enableRowSelection: tableConfig.enableRowSelection,
        enableColumnResizing: tableConfig.enableColumnResizing,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        onRowSelectionChange: handleRowSelectionChange,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        onPaginationChange: handlePaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    useEffect(() => {
        const totalPages = data?.pagination?.total_pages || 0;

        if (totalPages > 0 && page > totalPages) {
            setPage(1);
        }
    }, [data?.pagination?.total_pages, page, setPage]);

    const resetColumnSizing = useCallback(() => {
        setColumnSizing({});
    }, []);

    const resetColumnOrder = useCallback(() => {
        table.setColumnOrder([]);
        setColumnOrder([]);
    }, [table]);

    useEffect(() => {
        const tableState = table.getState().pagination;
        if (tableState.pageIndex !== page - 1 || tableState.pageSize !== pageSize) {
            if (
                tableState.pageSize !== pageSize ||
                Math.abs(tableState.pageIndex - (page - 1)) > 0
            ) {
                table.setPagination({
                    pageIndex: page - 1,
                    pageSize: pageSize,
                });
            }
        }
    }, [table, page, pageSize]);

    if (isError) {
        return (
            <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load data:
                    {error instanceof Error ? error.message : "Unknown error"}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            {tableConfig.enableToolbar && (
                <DataTableToolbar
                    table={table}
                    setSearch={setSearch}
                    setDateRange={setDateRange}
                    totalSelectedItems={totalSelectedItems}
                    config={tableConfig}
                    resetColumnSizing={resetColumnSizing}
                    resetColumnOrder={resetColumnOrder}
                    entityName={exportConfig.entityName}
                    columnMapping={exportConfig.columnMapping}
                    columnWidths={exportConfig.columnWidths}
                    headers={exportConfig.headers}
                    getAllItems={() => dataItems}
                    customToolbarComponent={
                        renderToolbarContent &&
                        renderToolbarContent({
                            selectedRows: dataItems.filter(
                                (item) => selectedItemIds[String(item[idField])]
                            ),
                            allSelectedIds: Object.keys(selectedItemIds),
                            totalSelectedCount: totalSelectedItems,
                            resetSelection: clearAllSelections,
                        })
                    }
                    columnFilterOptions={columnFilterOptions}
                    deleteFn={deleteFn}
                    assignFn={assignFn}
                    getSelectedIds={() => Object.keys(selectedItemIds)}
                />
            )}
            <div
                ref={tableContainerRef}
                className="overflow-auto rounded-md border table-container"
                aria-label="Data table"
            >
                <Table
                    className={`${
                        tableConfig.enableColumnResizing ? "resizable-table" : ""
                    } min-w-full`}
                    style={{ minWidth: "800px" }}
                >
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        className={`px-2 py-2 relative text-center group/th ${
                                            header.id === "actions" ? "w-20 min-w-20" : ""
                                        }`}
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        scope="col"
                                        tabIndex={-1}
                                        style={{
                                            width: header.getSize(),
                                        }}
                                        data-column-resizing={
                                            header.column.getIsResizing() ? "true" : undefined
                                        }
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                        {tableConfig.enableColumnResizing &&
                                            header.column.getCanResize() && (
                                                <DataTableResizer header={header} />
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: pageSize }).map((_, index) => (
                                <TableRow key={`loading-row-${index}`} tabIndex={-1}>
                                    {Array.from({ length: columns.length }).map((_, cellIndex) => (
                                        <TableCell
                                            key={`skeleton-cell-${index}-${cellIndex}`}
                                            className="px-4 py-2 truncate max-w-0 text-center"
                                            tabIndex={-1}
                                        >
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, rowIndex) => (
                                <TableRow
                                    key={row.id}
                                    id={`row-${rowIndex}`}
                                    data-row-index={rowIndex}
                                    data-state={row.getIsSelected() ? "selected" : undefined}
                                    tabIndex={0}
                                    aria-selected={row.getIsSelected()}
                                    onClick={() => {
                                        if (onRowClick) {
                                            onRowClick(row.original);
                                        } else if (tableConfig.enableClickRowSelect) {
                                            row.toggleSelected();
                                        }
                                    }}
                                    className={
                                        onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined
                                    }
                                    onFocus={(e) => {
                                        for (const el of document.querySelectorAll(
                                            '[data-focused="true"]'
                                        )) {
                                            el.removeAttribute("data-focused");
                                        }
                                        e.currentTarget.setAttribute("data-focused", "true");
                                    }}
                                >
                                    {row.getVisibleCells().map((cell, cellIndex) => (
                                        <TableCell
                                            className={`px-4 py-2 text-center ${
                                                cell.column.id === "actions"
                                                    ? "w-20 min-w-20"
                                                    : "truncate max-w-0"
                                            }`}
                                            key={cell.id}
                                            id={`cell-${rowIndex}-${cellIndex}`}
                                            data-cell-index={cellIndex}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center">
                                            <div className="text-lg font-medium">
                                                No results found
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2">
                                                Try adjusting your search or filter criteria.
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {tableConfig.enablePagination && (
                <DataTablePagination
                    table={table}
                    pageSizeOptions={pageSizeOptions || [10, 20, 30, 40, 50]}
                    size={tableConfig.size}
                />
            )}
        </div>
    );
}
