"use client";

import React from "react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { useNavigation } from "@/hooks/navigation/use-navigation";
import { NavigationConfig } from "@/types/ui";
import { cn } from "@/lib/utils";

interface DynamicBreadcrumbProps {
    customConfig?: NavigationConfig;
    maxItems?: number;
    mobileMaxItems?: number;
    className?: string;
}

export function DynamicBreadcrumb({
    customConfig,
    maxItems = 5,
    mobileMaxItems = 2,
    className,
}: DynamicBreadcrumbProps) {
    const { breadcrumbs } = useNavigation(customConfig);

    if (breadcrumbs.length === 0) {
        return null;
    }

    const getVisibleBreadcrumbs = (isMobile: boolean) => {
        const limit = isMobile ? mobileMaxItems : maxItems;

        if (breadcrumbs.length <= limit) {
            return { breadcrumbs, showEllipsis: false };
        }

        if (isMobile) {
            return {
                breadcrumbs: [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]],
                showEllipsis: breadcrumbs.length > 2,
            };
        }

        return {
            breadcrumbs: [breadcrumbs[0], ...breadcrumbs.slice(-limit + 1)],
            showEllipsis: true,
        };
    };

    const mobileView = getVisibleBreadcrumbs(true);
    const desktopView = getVisibleBreadcrumbs(false);

    const renderBreadcrumbs = (
        visibleBreadcrumbs: typeof mobileView.breadcrumbs,
        showEllipsis: boolean,
        originalLength: number
    ) => (
        <>
            {visibleBreadcrumbs.map((segment, index) => (
                <React.Fragment key={`${segment.href}-${index}`}>
                    {showEllipsis && index === 1 && originalLength > visibleBreadcrumbs.length && (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbEllipsis />
                            </BreadcrumbItem>
                        </>
                    )}

                    {index > 0 &&
                        !(
                            showEllipsis &&
                            index === 1 &&
                            originalLength > visibleBreadcrumbs.length
                        ) && <BreadcrumbSeparator />}

                    <BreadcrumbItem>
                        {segment.isCurrentPage || segment.isDynamicSegment ? (
                            <BreadcrumbPage className="max-w-[150px] truncate sm:max-w-none">
                                {segment.label}
                            </BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link
                                    href={segment.href}
                                    className="max-w-[150px] truncate sm:max-w-none"
                                    title={`Go to ${segment.label}`}
                                >
                                    {segment.label}
                                </Link>
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                </React.Fragment>
            ))}
        </>
    );

    return (
        <Breadcrumb className={cn("overflow-hidden", className)}>
            <BreadcrumbList className="flex-nowrap">
                <div className="flex items-center gap-1.5 sm:hidden">
                    {renderBreadcrumbs(
                        mobileView.breadcrumbs,
                        mobileView.showEllipsis,
                        breadcrumbs.length
                    )}
                </div>

                <div className="hidden sm:flex sm:items-center sm:gap-1.5">
                    {renderBreadcrumbs(
                        desktopView.breadcrumbs,
                        desktopView.showEllipsis,
                        breadcrumbs.length
                    )}
                </div>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
