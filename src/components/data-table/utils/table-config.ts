export interface TableConfig {
  enableRowSelection: boolean;

  enableClickRowSelect: boolean;

  enablePagination: boolean;

  enableSearch: boolean;

  enableColumnFilters: boolean;

  enableDateFilter: boolean;

  enableColumnVisibility: boolean;

  enableExport: boolean;

  enableUrlState: boolean;

  enableColumnResizing: boolean;

  enableToolbar: boolean;

  enableAssign: boolean;

  enableDelete: boolean;

  size: "sm" | "default" | "lg";
}

const defaultConfig: TableConfig = {
  enableRowSelection: true, // Row selection enabled by default
  enableClickRowSelect: false, // Clicking row to select disabled by default
  enablePagination: true, // Pagination enabled by default
  enableSearch: true, // Search enabled by default
  enableColumnFilters: true, // Column filters enabled by default
  enableDateFilter: false, // Date filter disabled by default
  enableColumnVisibility: true, // Column visibility options enabled by default
  enableExport: true, // Data export enabled by default
  enableUrlState: true, // URL state persistence enabled by default
  enableColumnResizing: true, // Column resizing enabled by default
  enableToolbar: true, // Toolbar enabled by default
  enableAssign: false, // Assign action disabled by default
  enableDelete: false, // Delete action disabled by default
  size: "default", // Default size for buttons and inputs
};

export function useTableConfig(
  overrideConfig?: Partial<TableConfig>,
): TableConfig {
  const config = { ...defaultConfig, ...overrideConfig };

  return config;
}
