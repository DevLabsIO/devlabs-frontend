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
    enableRowSelection: true,
    enableClickRowSelect: false,
    enablePagination: true,
    enableSearch: true,
    enableColumnFilters: true,
    enableDateFilter: false,
    enableColumnVisibility: true,
    enableExport: true,
    enableUrlState: true,
    enableColumnResizing: true,
    enableToolbar: true,
    enableAssign: false,
    enableDelete: false,
    size: "default",
};

export function useTableConfig(overrideConfig?: Partial<TableConfig>): TableConfig {
    const config = { ...defaultConfig, ...overrideConfig };

    return config;
}
