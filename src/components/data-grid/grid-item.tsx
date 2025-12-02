"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Calendar,
    Clock,
    User,
    Edit,
    Trash2,
    Eye,
    Check,
    X,
    Copy,
    Download,
    Share2,
    Archive,
    Star,
    RefreshCw,
    Send,
    Ban,
    Plus,
    Minus,
    Settings,
    MoreHorizontal,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { BaseGridItem, GridItemFieldConfig, GridItemAction, GridItemProps } from "@/types/ui";
import { useCallback, useMemo } from "react";

export type { BaseGridItem, GridItemFieldConfig, GridItemAction, GridItemProps };

// Icon mapping for common action labels (case-insensitive matching)
const actionIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    edit: Edit,
    delete: Trash2,
    remove: Trash2,
    view: Eye,
    preview: Eye,
    details: Eye,
    accept: Check,
    approve: Check,
    confirm: Check,
    reject: X,
    decline: X,
    cancel: X,
    deny: X,
    copy: Copy,
    duplicate: Copy,
    download: Download,
    export: Download,
    share: Share2,
    archive: Archive,
    favorite: Star,
    star: Star,
    refresh: RefreshCw,
    reload: RefreshCw,
    send: Send,
    submit: Send,
    ban: Ban,
    block: Ban,
    add: Plus,
    create: Plus,
    subtract: Minus,
    settings: Settings,
    configure: Settings,
    more: MoreHorizontal,
};

// Get icon for an action based on its label
const getActionIcon = (
    label: string,
    providedIcon?: React.ComponentType<{ className?: string }>
) => {
    if (providedIcon) return providedIcon;

    const normalizedLabel = label.toLowerCase().trim();

    // Check for exact match first
    if (actionIconMap[normalizedLabel]) {
        return actionIconMap[normalizedLabel];
    }

    // Check if label contains any of the keywords
    for (const [keyword, icon] of Object.entries(actionIconMap)) {
        if (normalizedLabel.includes(keyword)) {
            return icon;
        }
    }

    return null;
};

// Color palette for grid items - provides visual variety
const colorSchemes = [
    {
        gradient: "from-violet-500/10 via-purple-500/5 to-transparent",
        accent: "bg-violet-500",
        ring: "ring-violet-500/20",
        hover: "hover:border-violet-400/50 hover:shadow-violet-500/10",
        badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    },
    {
        gradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
        accent: "bg-blue-500",
        ring: "ring-blue-500/20",
        hover: "hover:border-blue-400/50 hover:shadow-blue-500/10",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    },
    {
        gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
        accent: "bg-emerald-500",
        ring: "ring-emerald-500/20",
        hover: "hover:border-emerald-400/50 hover:shadow-emerald-500/10",
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    },
    {
        gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
        accent: "bg-amber-500",
        ring: "ring-amber-500/20",
        hover: "hover:border-amber-400/50 hover:shadow-amber-500/10",
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    },
    {
        gradient: "from-rose-500/10 via-pink-500/5 to-transparent",
        accent: "bg-rose-500",
        ring: "ring-rose-500/20",
        hover: "hover:border-rose-400/50 hover:shadow-rose-500/10",
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    },
    {
        gradient: "from-indigo-500/10 via-blue-500/5 to-transparent",
        accent: "bg-indigo-500",
        ring: "ring-indigo-500/20",
        hover: "hover:border-indigo-400/50 hover:shadow-indigo-500/10",
        badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    },
];

// Simple hash function to get consistent color based on item id
const getColorIndex = (id: string | number): number => {
    const str = String(id);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % colorSchemes.length;
};

export function GridItem<T extends Record<string, unknown>>({
    item,
    isSelected,
    onToggleSelect,
    enableSelection = true,
    onCardClick,
    onEdit,
    onDelete,
    fieldConfig,
    actions = [],
    customBadge,
    customStats,
    customContent,
    entityName: _entityName = "item",
    columnVisibility = {},
}: GridItemProps<T>) {
    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(item);
        }
    };

    // Helper to check if a field is visible based on columnVisibility
    // If field is not in columnVisibility or is true, it's visible
    const isFieldVisible = useCallback(
        (field: keyof T | undefined): boolean => {
            if (!field) return false;
            const fieldStr = String(field);
            // If the field is not in columnVisibility, default to visible
            // If it's explicitly set to false, it's hidden
            return columnVisibility[fieldStr] !== false;
        },
        [columnVisibility]
    );

    const getId = useCallback(() => item[fieldConfig.id], [item, fieldConfig.id]);
    const getTitle = () => item[fieldConfig.title];
    const isTitleVisible = () => isFieldVisible(fieldConfig.title);
    const getDescription = () =>
        fieldConfig.description && isFieldVisible(fieldConfig.description)
            ? item[fieldConfig.description]
            : null;
    const getCreatedAt = () =>
        fieldConfig.createdAt && isFieldVisible(fieldConfig.createdAt)
            ? item[fieldConfig.createdAt]
            : null;
    const getUpdatedAt = () =>
        fieldConfig.updatedAt && isFieldVisible(fieldConfig.updatedAt)
            ? item[fieldConfig.updatedAt]
            : null;
    const getCreatedBy = () =>
        fieldConfig.createdBy && isFieldVisible(fieldConfig.createdBy)
            ? item[fieldConfig.createdBy]
            : null;

    // Filter stats based on column visibility
    const visibleStats = useMemo(() => {
        if (!fieldConfig.stats) return [];
        return fieldConfig.stats.filter((stat) => isFieldVisible(stat.field));
    }, [fieldConfig.stats, isFieldVisible]);

    // Check if badge should be visible
    const isBadgeVisible = useMemo(() => {
        if (!fieldConfig.badge) return false;
        return isFieldVisible(fieldConfig.badge.field);
    }, [fieldConfig.badge, isFieldVisible]);

    // Get consistent color scheme based on item ID
    const colorScheme = useMemo(() => {
        const id = getId();
        return colorSchemes[getColorIndex(id as string | number)];
    }, [getId]);

    // Build actions: use provided actions, or create defaults from onEdit/onDelete props
    const allActions = useMemo(() => {
        if (actions.length > 0) {
            return actions;
        }

        // Create default actions from onEdit/onDelete props
        const defaultActions: GridItemAction<T>[] = [];

        if (onEdit) {
            defaultActions.push({
                label: "Edit",
                variant: "outline",
                showAsButton: true,
                onClick: (item, e) => {
                    e.stopPropagation();
                    onEdit(item);
                },
            });
        }

        if (onDelete) {
            defaultActions.push({
                label: "Delete",
                variant: "destructive",
                showAsButton: true,
                onClick: (item, e) => {
                    e.stopPropagation();
                    onDelete(item);
                },
            });
        }

        return defaultActions;
    }, [actions, onEdit, onDelete]);

    // Separate actions into button actions and regular actions
    const buttonActions = useMemo(
        () => allActions.filter((action) => action.showAsButton !== false),
        [allActions]
    );

    return (
        <Card
            className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card text-card-foreground",
                "transition-all duration-300 ease-out cursor-pointer",
                "hover:shadow-xl hover:-translate-y-1",
                colorScheme.hover,
                isSelected && [
                    "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                    "shadow-lg shadow-primary/10",
                ]
            )}
            onClick={handleCardClick}
        >
            {/* Gradient accent at top */}
            <div
                className={cn(
                    "absolute inset-x-0 top-0 h-24 bg-linear-to-b pointer-events-none",
                    colorScheme.gradient
                )}
            />

            {/* Accent bar at top */}
            <div
                className={cn(
                    "absolute top-0 left-6 right-6 h-1 rounded-b-full opacity-80",
                    colorScheme.accent
                )}
            />

            <CardHeader className="relative pb-3 pt-5">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {enableSelection && (
                            <div
                                className={cn(
                                    "p-2 -m-2 cursor-pointer rounded-lg transition-all duration-200",
                                    "hover:bg-muted/80 hover:scale-105",
                                    isSelected && "bg-primary/10"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect();
                                }}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={onToggleSelect}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        "mt-1 transition-all duration-200",
                                        isSelected &&
                                            "border-primary data-[state=checked]:bg-primary"
                                    )}
                                />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            {isTitleVisible() && (
                                <CardTitle
                                    className="text-lg font-semibold line-clamp-1 tracking-tight"
                                    title={String(getTitle())}
                                >
                                    {String(getTitle())}
                                </CardTitle>
                            )}
                            <div className={cn("mt-2", !isTitleVisible() && "mt-0")}>
                                {customBadge ? (
                                    customBadge(item)
                                ) : fieldConfig.badge && isBadgeVisible ? (
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "text-xs font-medium px-2.5 py-0.5 rounded-full",
                                            "transition-colors duration-200",
                                            colorScheme.badge
                                        )}
                                    >
                                        {fieldConfig.badge.label && (
                                            <span className="opacity-70 inline-block mr-1">
                                                {fieldConfig.badge.label}
                                            </span>
                                        )}
                                        <span className="inline-block align-middle max-w-48 wrap-break-word line-clamp-1">
                                            {fieldConfig.badge.format
                                                ? fieldConfig.badge.format(
                                                      item[fieldConfig.badge.field]
                                                  )
                                                : String(item[fieldConfig.badge.field])}
                                        </span>
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative space-y-4 flex-1">
                {getDescription() && (
                    <div className="relative">
                        <p
                            className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
                            title={String(getDescription())}
                        >
                            {String(getDescription())}
                        </p>
                    </div>
                )}

                {customContent ? (
                    customContent(item)
                ) : (
                    <div className="space-y-3">
                        {customStats ? (
                            customStats(item)
                        ) : (
                            <>
                                {visibleStats.map((stat, index) => {
                                    const value = item[stat.field];
                                    const displayValue = stat.format
                                        ? stat.format(value)
                                        : String(value);

                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                "flex items-center text-sm gap-2 p-2 rounded-lg min-w-0",
                                                "bg-muted/50 transition-colors duration-200",
                                                "hover:bg-muted/80"
                                            )}
                                        >
                                            <stat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="text-muted-foreground text-xs">
                                                {stat.label}
                                            </span>
                                            <span className="font-medium ml-auto block text-right line-clamp-2 wrap-break-word max-w-72">
                                                {displayValue}
                                            </span>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                )}

                {/* Metadata section */}
                {(getCreatedBy() || getCreatedAt() || getUpdatedAt()) && (
                    <div className="pt-3 border-t border-border/50 space-y-2">
                        {getCreatedBy() && (
                            <div className="flex items-center text-sm gap-2">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-6 h-6 rounded-full",
                                        "bg-muted"
                                    )}
                                >
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-muted-foreground text-xs">by</span>
                                <span
                                    className="font-medium truncate text-sm"
                                    title={(() => {
                                        const createdBy = getCreatedBy();
                                        return typeof createdBy === "object" &&
                                            createdBy !== null &&
                                            "name" in createdBy
                                            ? String((createdBy as { name: unknown }).name)
                                            : String(createdBy);
                                    })()}
                                >
                                    {(() => {
                                        const createdBy = getCreatedBy();
                                        return typeof createdBy === "object" &&
                                            createdBy !== null &&
                                            "name" in createdBy
                                            ? String((createdBy as { name: unknown }).name)
                                            : String(createdBy);
                                    })()}
                                </span>
                            </div>
                        )}
                        {getCreatedAt() && (
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                                    <Calendar className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs">Created:</span>
                                <span className="text-xs font-medium">
                                    {new Date(String(getCreatedAt())).toLocaleDateString(
                                        undefined,
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }
                                    )}
                                </span>
                            </div>
                        )}
                        {getUpdatedAt() && (
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                                    <Clock className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs">Updated:</span>
                                <span className="text-xs font-medium">
                                    {new Date(String(getUpdatedAt())).toLocaleDateString(
                                        undefined,
                                        {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        }
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Action buttons footer */}
            {buttonActions.length > 0 && (
                <CardFooter className="relative pt-0 pb-4 px-6">
                    <div className="w-full pt-3 border-t border-border/50">
                        <TooltipProvider delayDuration={300}>
                            <div className="flex flex-wrap gap-2 justify-end">
                                {buttonActions.map((action, index) => {
                                    // Get the icon - either provided or auto-detected from label
                                    const ActionIcon = getActionIcon(action.label, action.icon);

                                    // Determine button styling based on variant
                                    const isDestructive = action.variant === "destructive";
                                    const isGhost = action.variant === "ghost";
                                    const isOutline = action.variant === "outline";
                                    const isSecondary = action.variant === "secondary";

                                    const buttonContent = (
                                        <Button
                                            key={index}
                                            variant={isGhost ? "ghost" : "outline"}
                                            size="sm"
                                            disabled={action.disabled}
                                            className={cn(
                                                "h-8 text-xs font-medium transition-all duration-200",
                                                "hover:scale-[1.02] active:scale-[0.98]",
                                                "inline-flex items-center",
                                                ActionIcon ? "pl-3 pr-2 gap-2" : "px-3",
                                                // Destructive - subtle red styling
                                                isDestructive && [
                                                    "text-muted-foreground hover:text-destructive",
                                                    "border-border/50 hover:border-destructive/30",
                                                    "hover:bg-destructive/5",
                                                ],
                                                // Default/Primary styling
                                                !isDestructive &&
                                                    !isSecondary &&
                                                    !isOutline &&
                                                    !isGhost && [
                                                        "text-foreground hover:text-primary",
                                                        "border-border/50 hover:border-primary/30",
                                                        "hover:bg-primary/5",
                                                    ],
                                                // Secondary styling
                                                isSecondary && [
                                                    "text-muted-foreground hover:text-foreground",
                                                    "border-border/50 hover:border-border",
                                                    "hover:bg-muted/50",
                                                ],
                                                // Outline keeps default
                                                isOutline && [
                                                    "text-foreground",
                                                    "border-border/50 hover:border-border",
                                                    "hover:bg-muted/50",
                                                ]
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                action.onClick(item, e);
                                            }}
                                        >
                                            <span>{action.label}</span>
                                            {ActionIcon && (
                                                <ActionIcon className="h-3.5 w-3.5 shrink-0 ml-1" />
                                            )}
                                        </Button>
                                    );

                                    // Wrap in tooltip if tooltip text is provided
                                    if (action.tooltip) {
                                        return (
                                            <Tooltip key={index}>
                                                <TooltipTrigger asChild>
                                                    {buttonContent}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{action.tooltip}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    }

                                    return buttonContent;
                                })}
                            </div>
                        </TooltipProvider>
                    </div>
                </CardFooter>
            )}

            {/* Subtle shine effect on hover */}
            <div
                className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100",
                    "bg-linear-to-r from-transparent via-white/5 to-transparent",
                    "-translate-x-full group-hover:translate-x-full",
                    "transition-all duration-700 ease-in-out pointer-events-none"
                )}
            />
        </Card>
    );
}

export const GridItemSkeleton = () => {
    return (
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-5">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />

            {/* Accent bar skeleton */}
            <div className="absolute top-0 left-6 right-6 h-1 rounded-b-full bg-muted animate-pulse" />

            <div className="space-y-4 relative flex-1">
                <div className="flex items-start justify-between pt-2">
                    <div className="flex items-start gap-3">
                        <Skeleton className="h-5 w-5 rounded-md" />
                        <div className="space-y-2.5">
                            <Skeleton className="h-5 w-36 rounded-md" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-4/5 rounded" />
                </div>

                <div className="pt-3 border-t border-border/30 space-y-2.5">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-3 w-20 rounded" />
                    </div>
                </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="pt-3 border-t border-border/30 mt-4">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            </div>
        </div>
    );
};
