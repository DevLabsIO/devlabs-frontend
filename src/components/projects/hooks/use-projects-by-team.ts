import { useQuery } from "@tanstack/react-query";
import { projectQueries } from "@/repo/project-queries/project-queries";

export const useProjectsByTeam = (teamId: string) => {
    return useQuery({
        queryKey: ["projects", teamId],
        queryFn: async () => {
            return projectQueries.fetchProjectByTeamId(teamId);
        },
        enabled: !!teamId,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });
};
