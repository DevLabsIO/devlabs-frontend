"use client";

import type { Table } from "@tanstack/react-table";
import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Settings,
  Undo2,
  EyeOff,
  CheckSquare,
  MoveHorizontal,
  X,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTableViewOptions } from "@/components/data-table/view-options";
import { DataTableFacetedFilter } from "@/components/data-table/column-filter";
import { DataTableExport } from "./data-export";
import { resetUrlState } from "./utils/deep-utils";
import { parseDateFromUrl } from "./utils/url-state";
import type { TableConfig } from "./utils/table-config";

const getInputSizeClass = (size: "sm" | "default" | "lg") => {
  switch (size) {
    case "sm":
      return "h-8";
    case "lg":
      return "h-11";
    default:
      return "";
  }
};

const getButtonSizeClass = (size: "sm" | "default" | "lg", isIcon = false) => {
  if (isIcon) {
    switch (size) {
      case "sm":
        return "h-8 w-8";
      case "lg":
        return "h-11 w-11";
      default:
        return "";
    }
  }
  switch (size) {
    case "sm":
      return "h-8 px-3";
    case "lg":
      return "h-11 px-5";
    default:
      return "";
  }
};

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  setSearch: (value: string | ((prev: string) => string)) => void;
  setDateRange: (
    value:
      | { from_date: string; to_date: string }
      | ((prev: { from_date: string; to_date: string }) => {
          from_date: string;
          to_date: string;
        }),
  ) => void;
  totalSelectedItems?: number;
  deleteSelection?: () => void;
  getSelectedItems?: () => Promise<TData[]>;
  getAllItems?: () => TData[];
  config: TableConfig;
  resetColumnSizing?: () => void;
  resetColumnOrder?: () => void;
  entityName?: string;
  columnMapping?: Record<string, string>;
  columnWidths?: Array<{ wch: number }>;
  headers?: string[];
  customToolbarComponent?: React.ReactNode;
  columnFilterOptions?: Array<{
    columnId: string;
    title: string;
    options: Array<{
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }>;
  }>;
  deleteFn?: (ids: (string | number)[]) => Promise<unknown>;
  assignFn?: (ids: (string | number)[]) => Promise<unknown>;
  getSelectedIds?: () => (string | number)[];
}

export function DataTableToolbar<TData>({
  table,
  setSearch,
  setDateRange,
  totalSelectedItems = 0,
  deleteSelection,
  getSelectedItems,
  getAllItems,
  config,
  resetColumnSizing,
  resetColumnOrder,
  entityName = "items",
  columnMapping,
  columnWidths,
  headers,
  customToolbarComponent,
  columnFilterOptions,
  deleteFn,
  assignFn,
  getSelectedIds,
}: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const tableFiltered = table.getState().columnFilters.length > 0;

  const searchParamFromUrl = searchParams.get("search") || "";

  const decodedSearchParam = searchParamFromUrl
    ? decodeURIComponent(searchParamFromUrl)
    : "";

  const currentSearchFromTable =
    (table.getState().globalFilter as string) || "";

  const [localSearch, setLocalSearch] = useState(
    decodedSearchParam || currentSearchFromTable,
  );

  const isLocallyUpdatingSearch = useRef(false);

  useEffect(() => {
    if (isLocallyUpdatingSearch.current) {
      return;
    }

    const searchFromUrl = searchParams.get("search") || "";
    const decodedSearchFromUrl = searchFromUrl
      ? decodeURIComponent(searchFromUrl)
      : "";

    if (decodedSearchFromUrl !== localSearch) {
      setLocalSearch(decodedSearchFromUrl);
    }
  }, [searchParams, localSearch]);

  const tableSearch = (table.getState().globalFilter as string) || "";

  useEffect(() => {
    if (isLocallyUpdatingSearch.current) {
      return;
    }

    if (tableSearch !== localSearch && tableSearch !== "") {
      setLocalSearch(tableSearch);
    }
  }, [tableSearch, localSearch]);

  const isUpdatingDates = useRef(false);

  const lastSetDates = useRef<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const getInitialDates = useCallback((): {
    from: Date | undefined;
    to: Date | undefined;
  } => {
    if (isUpdatingDates.current) {
      return lastSetDates.current;
    }

    const dateRangeParam = searchParams.get("dateRange");
    if (dateRangeParam) {
      try {
        const parsed = JSON.parse(dateRangeParam);

        const fromDate = parsed?.from_date
          ? parseDateFromUrl(parsed.from_date)
          : undefined;
        const toDate = parsed?.to_date
          ? parseDateFromUrl(parsed.to_date)
          : undefined;

        lastSetDates.current = { from: fromDate, to: toDate };

        return {
          from: fromDate,
          to: toDate,
        };
      } catch (e) {
        console.warn("Error parsing dateRange from URL:", e);
        return { from: undefined, to: undefined };
      }
    }
    return { from: undefined, to: undefined };
  }, [searchParams]);

  const [dates, setDates] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>(getInitialDates());

  const [datesModified, setDatesModified] = useState(
    !!dates.from || !!dates.to,
  );

  useEffect(() => {
    const initialDates = getInitialDates();
    if (initialDates.from || initialDates.to) {
      setDates(initialDates);
      setDatesModified(true);
    }
  }, [getInitialDates]); // Include memoized function as dependency

  const isFiltered = tableFiltered || !!localSearch || datesModified;

  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    isLocallyUpdatingSearch.current = true;
    setLocalSearch(value);

    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      const trimmedValue = value.trim();
      setSearch(trimmedValue);
      searchDebounceTimerRef.current = null;

      setTimeout(() => {
        isLocallyUpdatingSearch.current = false;
      }, 100);
    }, 500);
  };

  useEffect(() => {
    if (isUpdatingDates.current) {
      return;
    }

    const newDates = getInitialDates();

    const hasFromChanged =
      (newDates.from && !dates.from) ||
      (!newDates.from && dates.from) ||
      (newDates.from &&
        dates.from &&
        newDates.from.getTime() !== dates.from.getTime());

    const hasToChanged =
      (newDates.to && !dates.to) ||
      (!newDates.to && dates.to) ||
      (newDates.to && dates.to && newDates.to.getTime() !== dates.to.getTime());

    if (hasFromChanged || hasToChanged) {
      setDates(newDates);
      setDatesModified(!!(newDates.from || newDates.to));
    }
  }, [dates, getInitialDates]);

  const handleResetFilters = () => {
    table.resetColumnFilters();

    setLocalSearch("");
    setSearch("");

    setDates({
      from: undefined,
      to: undefined,
    });
    setDatesModified(false);
    setDateRange({
      from_date: "",
      to_date: "",
    });

    if (config.enableUrlState) {
      resetUrlState(router, pathname);
    }
  };

  const selectedItems =
    totalSelectedItems > 0
      ? new Array(totalSelectedItems).fill({} as TData)
      : [];

  const allItems = getAllItems ? getAllItems() : [];

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.invalidateQueries(); // Invalidate relevant queries
    },
    onError: (error: Error) => {
      console.error("Failed to delete items:", error);
    },
  });

  const assignMutation = useMutation({
    mutationFn: assignFn,
    onSuccess: () => {
      table.resetRowSelection();
      queryClient.invalidateQueries(); // Invalidate relevant queries
    },
    onError: (error: Error) => {
      console.error("Failed to assign items:", error);
    },
  });

  const handleDelete = () => {
    if (!getSelectedIds) return;
    const ids = getSelectedIds();
    if (ids.length > 0) {
      deleteMutation.mutate(ids);
    }
  };

  const handleAssign = () => {
    if (!getSelectedIds) return;
    const ids = getSelectedIds();
    if (ids.length > 0) {
      assignMutation.mutate(ids);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {config.enableSearch && (
          <Input
            placeholder={`Search ${entityName}...`}
            value={localSearch}
            onChange={handleSearchChange}
            className={`${getInputSizeClass(
              config.size,
            )} h-8 w-[150px] lg:w-[250px]`}
          />
        )}
        {}
        {config.enableColumnFilters &&
          columnFilterOptions &&
          columnFilterOptions.map((filter) => {
            const column = table.getColumn(filter.columnId);
            if (!column) return null;

            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                size={config.size}
              />
            );
          })}
        {totalSelectedItems > 0 && (
          <>
            {config.enableDelete && deleteFn && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className={getButtonSizeClass(config.size)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({totalSelectedItems})
              </Button>
            )}
            {config.enableAssign && assignFn && (
              <Button
                variant="outline"
                onClick={handleAssign}
                disabled={assignMutation.isPending}
                className={getButtonSizeClass(config.size)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign ({totalSelectedItems})
              </Button>
            )}
          </>
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleResetFilters}
            className={getButtonSizeClass(config.size)}
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {customToolbarComponent}

        {config.enableExport && (
          <DataTableExport
            table={table}
            data={allItems}
            selectedData={selectedItems}
            getSelectedItems={getSelectedItems}
            entityName={entityName}
            columnMapping={columnMapping}
            columnWidths={columnWidths}
            headers={headers}
            size={config.size}
          />
        )}

        {config.enableColumnVisibility && (
          <DataTableViewOptions
            table={table}
            columnMapping={columnMapping}
            size={config.size}
          />
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={getButtonSizeClass(config.size, true)}
              title="Table Settings"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Open table settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60" align="end">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Table Settings</h4>
              </div>

              <div className="grid gap-2">
                {config.enableColumnResizing && resetColumnSizing && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      resetColumnSizing();
                    }}
                  >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Reset Column Sizes
                  </Button>
                )}

                {resetColumnOrder && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      resetColumnOrder();
                    }}
                  >
                    <MoveHorizontal className="mr-2 h-4 w-4" />
                    Reset Column Order
                  </Button>
                )}

                {config.enableRowSelection && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={(e) => {
                      e.preventDefault();
                      if (deleteSelection) {
                        deleteSelection();
                      }
                      table.resetRowSelection();
                    }}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Clear Selection
                  </Button>
                )}

                {!table.getIsAllColumnsVisible() && (
                  <Button
                    variant="outline"
                    size={config.size}
                    className="justify-start"
                    onClick={() => table.resetColumnVisibility()}
                  >
                    <EyeOff className="mr-2 h-4 w-4" />
                    Show All Columns
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
