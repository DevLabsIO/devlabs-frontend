"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { BreadcrumbSegment, NavigationConfig } from "@/types/ui";

export type { BreadcrumbSegment, NavigationConfig };

const defaultNavigationConfig: NavigationConfig = {
    "/": { label: "Home" },
    "/dashboard": { label: "Dashboard" },
    "/courses": {
        label: "Courses",
        dynamicSegments: {
            uuid: "Course",
            "[courseid]/projects": "Projects",
            "[courseid]/results": "Results",
        },
    },
    "/projects": {
        label: "Projects",
        dynamicSegments: {
            uuid: "Project Details",
            "[id]/[reviewid]": "Project Review",
        },
    },
    "/teams": {
        label: "Teams",
        dynamicSegments: {
            uuid: "Team Details",
        },
    },
    "/reviews": {
        label: "Reviews",
        dynamicSegments: {
            uuid: "Review Details",
            "[id]/edit": "Edit Review",
            create: "Create Review",
        },
    },
    "/results": {
        label: "Results",
        dynamicSegments: {
            "[reviewid]/[projectid]": "Project Results",
        },
    },
    "/evaluate": {
        label: "Evaluate",
        dynamicSegments: {
            "[projectId]/[reviewId]": "Evaluation Form",
        },
    },
    "/user": {
        label: "Users",
        dynamicSegments: {
            uuid: "User Details",
        },
    },
    "/batch": {
        label: "Batches",
        dynamicSegments: {
            uuid: "Batch Details",
        },
    },
    "/semester": {
        label: "Semesters",
        dynamicSegments: {
            uuid: "Semester Details",
            "[semesterId]/courses": "Courses",
        },
    },
    "/department": { label: "Departments" },
    "/archives": { label: "Archives" },
    "/settings": { label: "Settings" },
    "/login": { label: "Login" },
    "/register": { label: "Register" },
};

const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    return uuidRegex.test(str.replace(/\s/g, ""));
};

const isNumericId = (str: string): boolean => {
    return /^\d+$/.test(str);
};

export function useNavigation(customConfig?: NavigationConfig) {
    const router = useRouter();
    const pathname = usePathname();
    const [canGoBack] = useState(() =>
        typeof window !== "undefined" ? window.history.length > 1 : false
    );
    const [canGoForward] = useState(false);

    const navigationConfig = useMemo(
        () => ({
            ...defaultNavigationConfig,
            ...customConfig,
        }),
        [customConfig]
    );

    const goBack = useCallback(() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
        }
    }, [router]);

    const goForward = useCallback(() => {
        router.forward();
    }, [router]);

    const navigateTo = useCallback(
        (path: string) => {
            router.push(path);
        },
        [router]
    );

    const generateBreadcrumbs = useCallback((): BreadcrumbSegment[] => {
        const segments = pathname.split("/").filter(Boolean);
        const breadcrumbs: BreadcrumbSegment[] = [];

        if (pathname !== "/" && !pathname.startsWith("/dashboard")) {
            breadcrumbs.push({
                label: "Dashboard",
                href: "/dashboard",
                isDynamicSegment: false,
            });
        }

        let currentPath = "";
        let parentPath = "";

        segments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLastSegment = index === segments.length - 1;
            let isDynamicSegment = false;
            let linkHref = currentPath;

            const config = navigationConfig[currentPath];
            let label = config?.label;

            if (!label) {
                const parentConfig = navigationConfig[parentPath];

                if (parentConfig?.dynamicSegments) {
                    if (isUUID(segment)) {
                        label = parentConfig.dynamicSegments["uuid"];
                        isDynamicSegment = true;
                        linkHref = parentPath || "/dashboard";
                    } else if (isNumericId(segment)) {
                        label = parentConfig.dynamicSegments["id"];
                        isDynamicSegment = true;
                        linkHref = parentPath || "/dashboard";
                    } else if (parentConfig.dynamicSegments[segment]) {
                        label = parentConfig.dynamicSegments[segment];
                        isDynamicSegment = true;
                        linkHref = parentPath || "/dashboard";
                    }
                }
            }

            if (!label) {
                if (segment.match(/^\[.*\]$/)) {
                    label = "Details";
                    isDynamicSegment = true;
                    linkHref = parentPath || "/dashboard";
                } else if (isUUID(segment)) {
                    label = "Details";
                    isDynamicSegment = true;
                    linkHref = parentPath || "/dashboard";
                } else {
                    label = segment
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                }
            }

            breadcrumbs.push({
                label,
                href: linkHref,
                isCurrentPage: isLastSegment,
                isDynamicSegment,
            });

            parentPath = currentPath;
        });

        return breadcrumbs;
    }, [pathname, navigationConfig]);

    const breadcrumbs = useMemo(() => generateBreadcrumbs(), [generateBreadcrumbs]);

    return {
        goBack,
        goForward,
        navigateTo,
        breadcrumbs,
        currentPath: pathname,
        canGoBack,
        canGoForward,
    };
}
