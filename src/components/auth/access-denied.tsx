"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function AccessDenied() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="flex flex-col items-center space-y-4 pt-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold">Access Denied</h2>
                        <p className="text-muted-foreground">
                            You don&apos;t have permission to access this page.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
