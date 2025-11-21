"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, Table } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "grid";

interface ViewToggleProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
    className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
    return (
        <div className={cn("flex rounded-lg border p-1", className)}>
            <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("table")}
                className={cn("flex items-center gap-2 h-8 px-3", view === "table" && "shadow-sm")}
            >
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
            </Button>
            <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("grid")}
                className={cn("flex items-center gap-2 h-8 px-3", view === "grid" && "shadow-sm")}
            >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
            </Button>
        </div>
    );
}
