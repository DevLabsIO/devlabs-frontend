"use client";

import { useQuery } from "@tanstack/react-query";
import { archiveQueries } from "@/repo/project-queries/archive-queries";
import { useSessionContext } from "@/lib/session-context";

export function useArchives(
    search: string = "",
    page: number = 0,
    pageSize: number = 10,
    sortBy: string = "updatedAt",
    sortOrder: "asc" | "desc" = "desc"
) {
    const { user: currentUser } = useSessionContext();

    return useQuery({
        queryKey: ["archives", currentUser?.id, search, page, pageSize, sortBy, sortOrder],
        queryFn: async () => {
            if (!currentUser?.id) {
                throw new Error("User not authenticated");
            }

            if (search.trim()) {
                return archiveQueries.searchArchivedProjects(
                    currentUser.id,
                    search.trim(),
                    page,
                    pageSize
                );
            } else {
                return archiveQueries.fetchArchivedProjects(currentUser.id, page, pageSize);
            }
        },
        enabled: !!currentUser?.id,
        staleTime: 5 * 60 * 1000,
    });
}
