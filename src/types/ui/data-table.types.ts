/**
 * Data Table UI Types
 * Types for data table components and pagination
 */

export interface DataTableResponse<T> {
  data: T[];
  pagination: {
    total_pages: number;
    current_page: number;
    per_page: number;
    total_count: number;
  };
}

export interface DataFetchParams {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

export interface DataFetchResult<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
