import { Loader2 } from "lucide-react";
import DashboardSkeleton from "./DashboardSkeleton";

interface LoadingStateProps {
    variant?: "spinner" | "skeleton";
    dashboardType?: "admin" | "manager" | "faculty" | "student";
}

export default function LoadingState({
    variant = "spinner",
    dashboardType = "admin",
}: LoadingStateProps) {
    if (variant === "skeleton" && dashboardType) {
        return <DashboardSkeleton variant={dashboardType} />;
    }

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
}
