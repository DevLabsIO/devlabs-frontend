"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, GraduationCap } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    image?: string;
}

interface Course {
    id: string;
    name: string;
}

interface ProjectSidebarProps {
    teamMembers: TeamMember[];
    courses: Course[];
}

export function ProjectSidebar({ teamMembers, courses }: ProjectSidebarProps) {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent>
                    <div className="flex items-center gap-2 text-lg font-semibold pb-4">
                        <Users className="h-5 w-5 text-primary" />
                        Team
                        <Badge variant="secondary" className="ml-2">
                            {teamMembers.length}
                        </Badge>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                            >
                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                    <AvatarImage src={member.image || ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                        {getInitials(member.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{member.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {member.email}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent>
                    <div className="flex items-center gap-2 text-lg font-semibold pb-4">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Courses
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {courses.map((course) => (
                            <Badge
                                key={course.id}
                                variant="secondary"
                                className="px-3 py-1.5 bg-primary/10 text-primary border-0 hover:bg-primary/20 transition-colors"
                            >
                                {course.name}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
