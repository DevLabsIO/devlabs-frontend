import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface BaseGridItem {
    id: string | number;
    name: string;
    description?: string;
    createdAt: string;
    createdBy?: {
        name: string;
    };
}

export interface GridItemFieldConfig<T> {
    id: keyof T;
    title: keyof T;
    description?: keyof T;
    createdAt?: keyof T;
    updatedAt?: keyof T;
    createdBy?: keyof T;

    badge?: {
        field: keyof T;
        label?: string;
        variant?: "default" | "secondary" | "destructive" | "outline";
        format?: (value: unknown) => string;
    };

    stats?: Array<{
        field: keyof T;
        label: string;
        icon: LucideIcon;
        format?: (value: unknown) => string | number;
    }>;
}

export interface GridItemAction<T> {
    label: string;
    icon?: LucideIcon;
    variant?: "default" | "destructive" | "secondary" | "outline" | "ghost";
    onClick: (item: T, event: React.MouseEvent) => void;
    separator?: boolean;
    /** If true, shows this action as a button in the card footer for quick access */
    showAsButton?: boolean;
    /** Optional tooltip text (defaults to label) */
    tooltip?: string;
    /** If true, the action is disabled */
    disabled?: boolean;
}

export interface GridItemProps<T extends Record<string, unknown>> {
    item: T;
    isSelected: boolean;
    onToggleSelect: () => void;
    enableSelection?: boolean;
    onCardClick?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;

    fieldConfig: GridItemFieldConfig<T>;
    actions?: GridItemAction<T>[];
    customBadge?: (item: T) => ReactNode;
    customStats?: (item: T) => ReactNode;
    customContent?: (item: T) => ReactNode;
    entityName?: string;
    /** Column visibility state from the table - fields with false values will be hidden */
    columnVisibility?: Record<string, boolean>;
}

export type ViewMode = "table" | "grid";
