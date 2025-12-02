"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectPageSkeleton() {
    return (
        <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-2/3" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full rounded-xl" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-40 w-full rounded-xl" />
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProjectError({ message }: { message: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="p-8 text-center">
                <p className="text-destructive">Error loading project: {message}</p>
            </Card>
        </div>
    );
}

export function ProjectNotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="p-8 text-center">
                <p className="text-muted-foreground">Project not found.</p>
            </Card>
        </div>
    );
}
