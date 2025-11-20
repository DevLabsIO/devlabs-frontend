"use client";

import { Button } from "@/components/ui/button";
import { BadgeCheck, X, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/entities";

interface ProjectActionsProps {
  project: Project;
}

export function ProjectActions({ project }: ProjectActionsProps) {
  const user = useCurrentUser();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: () => projectQueries.approveProject(project.id),
    onSuccess: () => {
      success("Project approved successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: Error) => {
      error(err.message || "Failed to approve project");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => projectQueries.rejectProject(project.id),
    onSuccess: () => {
      success("Project rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: Error) => {
      error(err.message || "Failed to reject project");
    },
  });

  const reProposeMutation = useMutation({
    mutationFn: () => projectQueries.reProposeProject(project.id),
    onSuccess: () => {
      success("Project re-proposed successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (err: Error) => {
      error(err.message || "Failed to re-propose project");
    },
  });

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      error("You must be logged in to approve projects");
      return;
    }
    approveMutation.mutate();
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      error("You must be logged in to reject projects");
      return;
    }
    rejectMutation.mutate();
  };

  const handleRePropose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      error("You must be logged in to re-propose projects");
      return;
    }
    reProposeMutation.mutate();
  };

  if (project.status === "COMPLETED") {
    return (
      <div className="flex justify-center">
        <span className="text-sm text-gray-500">No actions available</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2">
      {(project.status === "PROPOSED" || project.status === "REJECTED") && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            {approveMutation.isPending ? (
              "Approving..."
            ) : (
              <>
                Approve <BadgeCheck className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
          {project.status === "PROPOSED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {rejectMutation.isPending ? (
                "Rejecting..."
              ) : (
                <>
                  Reject <X className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </>
      )}
      {project.status === "ONGOING" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={rejectMutation.isPending}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {rejectMutation.isPending ? (
            "Rejecting..."
          ) : (
            <>
              Reject <X className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
      {project.status === "REJECTED" && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRePropose}
          disabled={reProposeMutation.isPending}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          {reProposeMutation.isPending ? (
            "Re-proposing..."
          ) : (
            <>
              Re-propose <RefreshCw className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
