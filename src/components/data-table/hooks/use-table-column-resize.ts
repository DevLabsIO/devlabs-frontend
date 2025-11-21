"use client";

import { useState, useCallback } from "react";
import { ColumnSizingState } from "@tanstack/react-table";

export function useTableColumnResize(enableResizing: boolean = false) {
    const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

    const handleSetColumnSizing = useCallback(
        (newSizing: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => {
            if (enableResizing) {
                setColumnSizing(newSizing);
            }
        },
        [enableResizing]
    );

    const resetColumnSizing = useCallback(() => {
        if (enableResizing) {
            setColumnSizing({});
        }
    }, [enableResizing]);

    return {
        columnSizing,
        setColumnSizing: handleSetColumnSizing,
        resetColumnSizing,
    };
}
