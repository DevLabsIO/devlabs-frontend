import { SidebarInset } from "@/components/ui/sidebar";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DynamicBreadcrumb } from "@/components/navigation/breadcrumb/dynamic-breadcrumb";

export function AppSidebarInset({ children }: { children: React.ReactNode }) {
    return (
        <SidebarInset className="overflow-x-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4 flex-1 min-w-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SidebarTrigger className="-ml-1 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" align="start">
                            Toggle Sidebar <kbd className="ml-2">⌘+b</kbd>
                        </TooltipContent>
                    </Tooltip>
                    <DynamicBreadcrumb className="flex-1 min-w-0" />
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        </SidebarInset>
    );
}
