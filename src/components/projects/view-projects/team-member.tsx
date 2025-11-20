"use client";

import { useTeam } from "@/components/teams/hooks/use-team-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Users, AlertTriangle } from "lucide-react";
import type { User } from "@/types/entities";

export const TeamMembersSkeleton = () => (
  <Card className="h-fit">
    <CardHeader>
      <Skeleton className="h-6 w-32" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

interface TeamMembersProps {
  teamId: string;
}

export function TeamMembers({ teamId }: TeamMembersProps) {
  const { data: team, isLoading, isError, isSuccess } = useTeam(teamId);

  if (isLoading) {
    return <TeamMembersSkeleton />;
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Unable to load team members.</AlertDescription>
      </Alert>
    );
  }

  if (isSuccess && team) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-semibold">
            <Users className="mr-2 h-5 w-5 text-muted-foreground" />
            Team Members
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({team.members.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {team.members.map((member: User) => (
            <div key={member.id} className="flex items-center space-x-3 group">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={(member.profileImage as string) || "/placeholder.svg"}
                  alt={member.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {member.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {member.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return <TeamMembersSkeleton />;
}
