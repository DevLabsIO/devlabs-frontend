"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  GitBranch,
  Folder,
  AlertTriangle,
} from "lucide-react";
import { Project } from "@/types/entities";

const getStatusColor = (status: string) => {
  switch (status) {
    case "PROPOSED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ONGOING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PROPOSED":
      return <Folder className="h-4 w-4" />;
    case "ONGOING":
      return <Calendar className="h-4 w-4" />;
    case "COMPLETED":
      return <GitBranch className="h-4 w-4" />;
    case "REJECTED":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Folder className="h-4 w-4" />;
  }
};

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const router = useRouter();

  return (
    <Card
      className="w-full hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {project.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </CardDescription>
          </div>
          <div className="ml-4 flex flex-col items-end gap-2">
            <Badge className={`${getStatusColor(project.status)} border`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(project.status)}
                {project.status === "ONGOING"
                  ? "Live"
                  : project.status.charAt(0).toUpperCase() +
                    project.status.slice(1).toLowerCase()}
              </span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {project.objectives && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Objectives
              </p>
              <p className="text-sm text-foreground line-clamp-3">
                {project.objectives}
              </p>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{project.teamMembers?.length || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {project.githubUrl && (
              <div className="flex items-center gap-1">
                <GitBranch className="h-4 w-4" />
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
