"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ReviewErrorStateProps {
  error: Error | null;
  onBack: () => void;
}

export function ReviewErrorState({ error, onBack }: ReviewErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold text-destructive">
          Error Loading Review
        </h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load review"}
        </p>
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
