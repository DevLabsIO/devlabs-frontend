"use client";

import { useTeam } from "@/components/teams/hooks/use-team-projects";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, AlertTriangle, Building2 } from "lucide-react";
import { User } from "@/types/entities";

export const TeamHeaderSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

interface TeamHeaderProps {
  teamId: string;
}

export function TeamHeader({ teamId }: TeamHeaderProps) {
  const { data: team, isLoading, isError, isSuccess } = useTeam(teamId);

  if (isLoading) {
    return <TeamHeaderSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          An error occurred while fetching team details.
        </AlertDescription>
      </Alert>
    );
  }

  if (isSuccess && !team) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Team could not be found.</AlertDescription>
      </Alert>
    );
  }

  if (isSuccess && team) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
              {team.description && (
                <p className="text-muted-foreground mt-1 text-lg">
                  {team.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-md font-semibold">
                Team Members ({team.members.length})
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.members.map((member: User) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        (member.profileImage as string) || "/placeholder.svg"
                      }
                      alt={member.name}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <TeamHeaderSkeleton />;
}
