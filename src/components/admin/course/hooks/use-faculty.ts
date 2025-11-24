import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";
import { courseQueries } from "@/repo/course-queries/course-queries";

export const useFaculty = (enabled: boolean = false) => {
    const { session } = useSessionContext();

    return useQuery({
        queryKey: ["faculty"],
        queryFn: () => {
            return courseQueries.getFaculty();
        },
        enabled: !!session && enabled,
        refetchOnWindowFocus: false,
    });
};
