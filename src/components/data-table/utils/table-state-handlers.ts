import type {
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
  ColumnSizingState,
} from "@tanstack/react-table";

type SortingUpdater = (prev: SortingState) => SortingState;
type StatePromise = Promise<URLSearchParams> | undefined;
type SetStateFunction<T> = (value: T | ((prev: T) => T)) => StatePromise;

export function createSortingHandler(
  setSortBy: SetStateFunction<string>,
  setSortOrder: SetStateFunction<"asc" | "desc">,
  currentSorting: SortingState = [],
) {
  return (updaterOrValue: SortingState | SortingUpdater): void => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(currentSorting)
        : updaterOrValue;

    if (newSorting.length > 0) {
      const columnId = newSorting[0].id;
      const direction = newSorting[0].desc ? "desc" : "asc";

      const sortByResult = setSortBy(columnId);

      if (sortByResult instanceof Promise) {
        sortByResult.then(() => {
          setSortOrder(direction);
        });
      } else {
        setSortOrder(direction);
      }
    }
  };
}

export function createColumnFiltersHandler(
  setColumnFilters: SetStateFunction<ColumnFiltersState>,
) {
  return (
    updaterOrValue:
      | ColumnFiltersState
      | ((prev: ColumnFiltersState) => ColumnFiltersState),
  ) => {
    setColumnFilters(updaterOrValue);
  };
}

export function createColumnVisibilityHandler(
  setColumnVisibility: SetStateFunction<VisibilityState>,
) {
  return (
    updaterOrValue:
      | VisibilityState
      | ((prev: VisibilityState) => VisibilityState),
  ) => {
    setColumnVisibility(updaterOrValue);
  };
}

export function createPaginationHandler(
  setPage: SetStateFunction<number>,
  setPageSize: SetStateFunction<number>,
  currentPage: number,
  currentPageSize: number,
) {
  return (
    updaterOrValue:
      | PaginationState
      | ((prev: PaginationState) => PaginationState),
  ) => {
    const newPagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue({
            pageIndex: currentPage - 1,
            pageSize: currentPageSize,
          })
        : updaterOrValue;

    setPage(newPagination.pageIndex + 1);
    setPageSize(newPagination.pageSize);
  };
}

export function createColumnSizingHandler(
  setColumnSizing: SetStateFunction<ColumnSizingState>,
  columnSizing: ColumnSizingState,
) {
  return (
    updaterOrValue:
      | ColumnSizingState
      | ((prev: ColumnSizingState) => ColumnSizingState),
  ) => {
    const newSizing =
      typeof updaterOrValue === "function"
        ? updaterOrValue(columnSizing)
        : updaterOrValue;
    setColumnSizing(newSizing);
  };
}

export function createSortingState(
  sortBy?: string,
  sortOrder?: "asc" | "desc",
): SortingState {
  return sortBy && sortOrder
    ? [{ id: sortBy, desc: sortOrder === "desc" }]
    : [];
}
