"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (resolvedTheme === "dark") {
            setTheme("light");
        } else {
            setTheme("dark");
        }
    };

    const getThemeIcon = () => {
        if (!mounted) return <Sun className="size-4" />;

        return resolvedTheme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />;
    };

    const getThemeLabel = () => {
        if (!mounted) return "Dark";
        return resolvedTheme === "dark" ? "Dark" : "Light";
    };

    return (
        <SidebarMenuButton
            onClick={toggleTheme}
            tooltip={
                mounted
                    ? `Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} theme`
                    : "Switch theme"
            }
        >
            {getThemeIcon()}
            <span>{getThemeLabel()}</span>
        </SidebarMenuButton>
    );
}
