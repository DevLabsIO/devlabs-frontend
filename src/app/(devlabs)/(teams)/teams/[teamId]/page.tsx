"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import { useSessionContext } from "@/lib/session-context";
import { TeamHeader } from "@/components/projects/view-projects/team-header";
import { Projects } from "@/components/projects/view-projects/projects";

const TeamDetailsSkeleton = () => (
    <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        </div>
    </div>
);

export default function TeamDetailsPage() {
    const { teamId } = useParams();
    const { status, isLoading } = useSessionContext();

    if (isLoading) {
        return <TeamDetailsSkeleton />;
    }

    if (status === "unauthenticated") {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Authentication Required</AlertTitle>
                    <AlertDescription>You must be logged in to view team details.</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!teamId || Array.isArray(teamId)) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <TeamHeader teamId={teamId} />
                <Projects teamId={teamId} />
            </div>
        </div>
    );
}
