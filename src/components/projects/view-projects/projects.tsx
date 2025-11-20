"use client";

import { useState } from "react";
import { useProjectsByTeam } from "@/components/projects/hooks/use-projects-by-team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FolderGit,
  AlertTriangle,
  Info,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Project, ProjectStatus } from "@/types/entities";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { CreateProjectRequest } from "@/components/projects/types/types";
import { ProjectForm } from "@/components/projects/view-projects/project-form";
import { useSessionContext } from "@/lib/session-context";

export const ProjectsSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-7 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-4">
      <Skeleton className="h-10 w-full rounded-md mb-4" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </CardContent>
  </Card>
);

interface ProjectsProps {
  teamId: string;
}

const getStatusIcon = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.PROPOSED:
    case ProjectStatus.ONGOING:
      return <Clock className="h-3 w-3" />;
    case ProjectStatus.COMPLETED:
      return <CheckCircle className="h-3 w-3" />;
    case ProjectStatus.REJECTED:
      return <XCircle className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.ONGOING:
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    case ProjectStatus.COMPLETED:
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    case ProjectStatus.REJECTED:
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case ProjectStatus.PROPOSED:
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
  }
};

export function Projects({ teamId }: ProjectsProps) {
  const { session } = useSessionContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "live";
  const [isFormOpen, setIsFormOpen] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading: areProjectsLoading,
    isFetching: areProjectsFetching,
    isError: areProjectsError,
  } = useProjectsByTeam(teamId);

  const createProjectMutation = useMutation({
    mutationFn: (project: CreateProjectRequest) => {
      return projectQueries.createProject(project);
    },
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects", teamId] });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  if (areProjectsError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Projects could not be loaded.</AlertDescription>
      </Alert>
    );
  }

  const handleTabChange = (value: string) => {
    router.push(`/teams/${teamId}?tab=${value}`);
  };

  const handleSubmit = (data: CreateProjectRequest) => {
    createProjectMutation.mutate(data);
  };

  const filterProjects = (status: ProjectStatus[]) => {
    return projects?.filter((p: Project) => status.includes(p.status)) || [];
  };

  const liveProjects = filterProjects([
    ProjectStatus.PROPOSED,
    ProjectStatus.ONGOING,
  ]);
  const completedProjects = filterProjects([ProjectStatus.COMPLETED]);
  const rejectedProjects = filterProjects([ProjectStatus.REJECTED]);

  const renderProjectGrid = (projectsToRender: Project[]) => {
    if (projectsToRender.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <Info className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Get started by creating your first project for this team.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectsToRender.map((project) => (
          <Card
            key={project.id}
            className="group hover:shadow-md transition-all duration-200 hover:border-primary/20"
          >
            <Link href={`/projects/${project.id}`} className="block">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                      {project.title}
                    </h4>
                    <Badge
                      className={`ml-2 flex items-center gap-1 text-xs ${getStatusColor(
                        project.status,
                      )}`}
                    >
                      {getStatusIcon(project.status)}
                      {project.status === ProjectStatus.ONGOING
                        ? "Live"
                        : project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    );
  };

  const tabCounts = {
    live: liveProjects.length,
    completed: completedProjects.length,
    rejected: rejectedProjects.length,
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <FolderGit className="h-5 w-5 text-primary" />
              </div>
              Projects ({projects?.length || 0})
            </CardTitle>
            <Button onClick={() => setIsFormOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={currentTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="live" className="gap-2">
                Live
                {tabCounts.live > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tabCounts.live}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                Completed
                {tabCounts.completed > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tabCounts.completed}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                Rejected
                {tabCounts.rejected > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {tabCounts.rejected}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="relative">
              {(areProjectsLoading || areProjectsFetching) && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">
                      Loading projects...
                    </span>
                  </div>
                </div>
              )}

              <TabsContent value="live" className="mt-0">
                {renderProjectGrid(liveProjects)}
              </TabsContent>
              <TabsContent value="completed" className="mt-0">
                {renderProjectGrid(completedProjects)}
              </TabsContent>
              <TabsContent value="rejected" className="mt-0">
                {renderProjectGrid(rejectedProjects)}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      <ProjectForm
        userId={session?.user?.id ?? ""}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        isLoading={createProjectMutation.isPending}
        teamId={teamId}
      />
    </>
  );
}
