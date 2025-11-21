"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Users } from "lucide-react";

export type ViewMode = "criteria" | "student";

interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
                variant={currentView === "criteria" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("criteria")}
                className="flex items-center gap-2"
            >
                <List className="w-4 h-4" />
                Criteria View
            </Button>
            <Button
                variant={currentView === "student" ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange("student")}
                className="flex items-center gap-2"
            >
                <Users className="w-4 h-4" />
                Student View
            </Button>
        </div>
    );
}

const getInitialViewMode = (): ViewMode => {
    if (typeof window === "undefined") return "criteria";
    const savedView = window.localStorage.getItem("evaluation-view-mode");
    if (savedView === "criteria" || savedView === "student") {
        return savedView;
    }
    return "criteria";
};

export function useViewMode(): [ViewMode, (view: ViewMode) => void] {
    const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);

    const changeView = (view: ViewMode) => {
        setViewMode(view);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("evaluation-view-mode", view);
        }
    };

    return [viewMode, changeView];
}
