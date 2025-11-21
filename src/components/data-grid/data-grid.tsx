"use client";

import type * as React from "react";
import {
  type ColumnSizingState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useEffect, useCallback, useMemo, useState } from "react";

import { DataTablePagination } from "@/components/data-table/pagination";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  useTableConfig,
  type TableConfig,
} from "@/components/data-table/utils/table-config";
import { preprocessSearch } from "@/components/data-table/utils/search";
import {
  createSortingHandler,
  createColumnFiltersHandler,
  createColumnVisibilityHandler,
  createSortingState,
} from "@/components/data-table/utils/table-state-handlers";
import { createConditionalStateHook } from "@/components/data-table/utils/conditional-state";
import { GridItemSkeleton } from "./grid-item";

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
type RowSelectionUpdater = (
  prev: Record<string, boolean>,
) => Record<string, boolean>;

interface DataGridProps<TData, TValue> {
  config?: Partial<TableConfig>;

  defaultSort?: {
    sortBy: string;
    sortOrder: "asc" | "desc";
  };

  getColumns: (
    handleRowDeselection: ((rowId: string) => void) | null | undefined,
  ) => ColumnDef<TData, TValue>[];

  renderGridItem: (
    item: TData,
    index: number,
    isSelected: boolean,
    onToggleSelect: () => void,
    onEdit?: (item: TData) => void,
    onDelete?: (item: TData) => void,
  ) => React.ReactNode;

  fetchDataFn:
    | ((params: DataFetchParams) => Promise<DataFetchResult<TData>>)
    | ((
        page: number,
        pageSize: number,
        search: string,
        dateRange: { from_date: string; to_date: string },
        sortBy: string,
        sortOrder: string,
      ) => unknown);

  fetchByIdsFn?: (ids: number[] | string[]) => Promise<TData[]>;

  exportConfig: {
    entityName: string;
    columnMapping: Record<string, string>;
    columnWidths: Array<{ wch: number }>;
    headers: string[];
  };

  idField: keyof TData;

  pageSizeOptions?: number[];

  paginationLabel?: string;

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

  gridConfig?: {
    columns?: {
      default: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
      "2xl"?: number;
    };
    gap?: number;
  };

  onEdit?: (item: TData) => void;
  onDelete?: (item: TData) => void;
}

export function DataGrid<TData, TValue>({
  config = {},
  defaultSort,
  getColumns,
  renderGridItem,
  fetchDataFn,
  fetchByIdsFn,
  exportConfig,
  idField = "id" as keyof TData,
  pageSizeOptions,
  paginationLabel,
  renderToolbarContent,
  columnFilterOptions,
  gridConfig = {
    columns: { default: 1, sm: 2, lg: 3, "2xl": 4 },
    gap: 4,
  },
  onEdit,
  onDelete,
}: DataGridProps<TData, TValue>) {
  const tableConfig = useTableConfig(config);

  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const useConditionalUrlState = createConditionalStateHook(
    tableConfig.enableUrlState,
  );

  const [page, setPage] = useConditionalUrlState("page", 1);
  const [pageSize, setPageSize] = useConditionalUrlState("pageSize", 12);
  const [search, setSearch] = useConditionalUrlState("search", "");
  const [dateRange, setDateRange] = useConditionalUrlState<{
    from_date: string;
    to_date: string;
  }>("dateRange", { from_date: "", to_date: "" });
  const [sortBy, setSortBy] = useConditionalUrlState(
    "sortBy",
    defaultSort?.sortBy || "name",
  );
  const [sortOrder, setSortOrder] = useConditionalUrlState<"asc" | "desc">(
    "sortOrder",
    defaultSort?.sortOrder || "asc",
  );
  const [columnVisibility, setColumnVisibility] = useConditionalUrlState<
    Record<string, boolean>
  >("columnVisibility", {});
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
  const [selectedItemIds, setSelectedItemIds] = useState<
    Record<string | number, boolean>
  >({});

  const sorting = useMemo(
    () => createSortingState(sortBy, sortOrder),
    [sortBy, sortOrder],
  );

  const serverColumnFilters = useMemo(() => {
    const filters: Record<string, string[]> = {};
    columnFilters.forEach((filter) => {
      if (
        filter.value &&
        Array.isArray(filter.value) &&
        filter.value.length > 0
      ) {
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
    [selectedItemIds],
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
    [dataItems, idField],
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
    [dataItems, rowSelection, idField],
  );

  const getSelectedItems = useCallback(async () => {
    if (totalSelectedItems === 0) {
      return [];
    }

    const selectedIdsArray = Object.keys(selectedItemIds).map((id) =>
      typeof id === "string" ? Number.parseInt(id, 10) : (id as number),
    );

    const itemsInCurrentPage = dataItems.filter(
      (item) => selectedItemIds[String(item[idField])],
    );

    const idsInCurrentPage = itemsInCurrentPage.map(
      (item) => item[idField] as unknown as number,
    );

    const idsToFetch = selectedIdsArray.filter(
      (id) => !idsInCurrentPage.includes(id),
    );

    if (idsToFetch.length === 0 || !fetchByIdsFn) {
      return itemsInCurrentPage;
    }

    try {
      const fetchedItems = await fetchByIdsFn(idsToFetch);

      return [...itemsInCurrentPage, ...fetchedItems];
    } catch (error) {
      console.error("Error fetching selected items:", error);
      return itemsInCurrentPage;
    }
  }, [dataItems, selectedItemIds, totalSelectedItems, fetchByIdsFn, idField]);

  const getAllItems = useCallback((): TData[] => {
    return dataItems;
  }, [dataItems]);

  useEffect(() => {
    const isQueryHook =
      (fetchDataFn as { isQueryHook?: boolean }).isQueryHook === true;

    if (!isQueryHook) {
      const currentSortBy = sortBy;
      const currentSortOrder = sortOrder;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const result = await (
            fetchDataFn as (
              params: DataFetchParams,
            ) => Promise<DataFetchResult<TData>>
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
  }, [
    page,
    pageSize,
    search,
    dateRange,
    sortBy,
    sortOrder,
    serverColumnFilters,
    fetchDataFn,
  ]);

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
            columnFilters?: Record<string, string[]>,
          ) => {
            isLoading: boolean;
            isSuccess: boolean;
            isError: boolean;
            data?: DataFetchResult<TData>;
            error?: Error;
          }
        )(
          page,
          pageSize,
          search,
          dateRange,
          sortBy,
          sortOrder,
          serverColumnFilters,
        )
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
            : new Error("Unknown error"),
        );
      }
    }
  }, [queryResult]);

  const pagination = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize,
    }),
    [page, pageSize],
  );

  const columns = useMemo(() => {
    return getColumns(
      tableConfig.enableRowSelection ? handleRowDeselection : null,
    );
  }, [getColumns, handleRowDeselection, tableConfig.enableRowSelection]);

  const handleColumnFiltersChange = useCallback(
    (
      updaterOrValue:
        | import("@tanstack/react-table").ColumnFiltersState
        | import("@tanstack/react-table").Updater<
            import("@tanstack/react-table").ColumnFiltersState
          >,
    ) => {
      const handler = createColumnFiltersHandler(setColumnFilters);
      return handler(updaterOrValue);
    },
    [setColumnFilters],
  );
  const handleColumnVisibilityChange = useCallback(
    (
      updaterOrValue:
        | import("@tanstack/react-table").VisibilityState
        | import("@tanstack/react-table").Updater<
            import("@tanstack/react-table").VisibilityState
          >,
    ) => {
      const handler = createColumnVisibilityHandler(setColumnVisibility);
      return handler(updaterOrValue);
    },
    [setColumnVisibility],
  );

  const handleSortingChange = useCallback(
    (
      updaterOrValue:
        | import("@tanstack/react-table").SortingState
        | import("@tanstack/react-table").Updater<
            import("@tanstack/react-table").SortingState
          >,
    ) => {
      const handler = createSortingHandler(setSortBy, setSortOrder, sorting);
      return handler(updaterOrValue);
    },
    [setSortBy, setSortOrder, sorting],
  );

  const handlePaginationChange = useCallback(
    (
      updaterOrValue:
        | PaginationUpdater
        | { pageIndex: number; pageSize: number },
    ) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue({ pageIndex: page - 1, pageSize })
          : updaterOrValue;

      if (newPagination.pageSize !== pageSize) {
        Promise.all([setPageSize(newPagination.pageSize), setPage(1)]).catch(
          console.error,
        );

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
    [page, pageSize, setPage, setPageSize],
  );

  const handleColumnSizingChange = useCallback(
    (
      updaterOrValue:
        | ColumnSizingState
        | ((prev: ColumnSizingState) => ColumnSizingState),
    ) => {
      if (typeof updaterOrValue === "function") {
        setColumnSizing((current) => updaterOrValue(current));
      } else {
        setColumnSizing(updaterOrValue);
      }
    },
    [setColumnSizing],
  );

  void handleColumnSizingChange;

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
    },
    pageCount: data?.pagination?.total_pages || 0,
    enableRowSelection: tableConfig.enableRowSelection,
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

  const gridClasses = useMemo(() => {
    const baseClass = "grid";
    const gapClass = `gap-${gridConfig.gap || 4}`;

    const colClasses = [];
    if (gridConfig.columns?.default) {
      colClasses.push(`grid-cols-${gridConfig.columns.default}`);
    }
    if (gridConfig.columns?.sm) {
      colClasses.push(`sm:grid-cols-${gridConfig.columns.sm}`);
    }
    if (gridConfig.columns?.md) {
      colClasses.push(`md:grid-cols-${gridConfig.columns.md}`);
    }
    if (gridConfig.columns?.lg) {
      colClasses.push(`lg:grid-cols-${gridConfig.columns.lg}`);
    }
    if (gridConfig.columns?.xl) {
      colClasses.push(`xl:grid-cols-${gridConfig.columns.xl}`);
    }
    if (gridConfig.columns?.["2xl"]) {
      colClasses.push(`2xl:grid-cols-${gridConfig.columns["2xl"]}`);
    }

    return [baseClass, gapClass, ...colClasses].join(" ");
  }, [gridConfig]);

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
          deleteSelection={clearAllSelections}
          getSelectedItems={getSelectedItems}
          getAllItems={getAllItems}
          config={tableConfig}
          resetColumnSizing={() => {}}
          resetColumnOrder={() => {}}
          entityName={exportConfig.entityName}
          columnMapping={exportConfig.columnMapping}
          columnWidths={exportConfig.columnWidths}
          headers={exportConfig.headers}
          columnFilterOptions={columnFilterOptions}
          customToolbarComponent={renderToolbarContent?.({
            selectedRows: dataItems.filter(
              (item) => selectedItemIds[String(item[idField])],
            ),
            allSelectedIds: Object.keys(selectedItemIds),
            totalSelectedCount: totalSelectedItems,
            resetSelection: clearAllSelections,
          })}
        />
      )}
      <div aria-label="Data grid">
        {isLoading ? (
          <div className={gridClasses}>
            {Array.from({ length: pageSize }).map((_, index) => (
              <GridItemSkeleton key={`loading-item-${index}`} />
            ))}
          </div>
        ) : dataItems.length > 0 ? (
          <div className={gridClasses}>
            {table.getRowModel().rows.map((row, index) => {
              const item = row.original;
              const isSelected = row.getIsSelected();
              const onToggleSelect = () => {
                row.toggleSelected(!isSelected);
              };
              return (
                <div key={String(item[idField])}>
                  {renderGridItem(
                    item,
                    index,
                    isSelected,
                    onToggleSelect,
                    onEdit,
                    onDelete,
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-lg font-medium">No results found</div>
              <div className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filter criteria.
              </div>
            </div>
          </div>
        )}
      </div>
      {tableConfig.enablePagination && (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions || [12, 24, 36, 48, 60]}
          size={tableConfig.size}
          paginationLabel={paginationLabel || "Items per page"}
        />
      )}
    </div>
  );
}
