"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, X, Users, SearchX } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { GridItem, GridItemSkeleton } from "@/components/data-grid/grid-item";
import type { GridItemFieldConfig, GridItemAction } from "@/types/ui";
import type {
    ReviewProjectsResponse,
    ReviewProjectInfo,
    TeamFilterInfo,
    BatchFilterInfo,
    CourseFilterInfo,
} from "@/types/api";

type ReviewProjectInfoWithIndex = ReviewProjectInfo & { [key: string]: unknown };

interface ReviewProjectsTabProps {
    reviewId: string;
    reviewProjects: ReviewProjectsResponse;
}

export function ReviewProjectsTab({
    reviewId,
    reviewProjects: initialData,
}: ReviewProjectsTabProps) {
    const router = useRouter();
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

    const teamId = selectedTeams.length > 0 ? selectedTeams[0] : undefined;
    const batchId = selectedBatches.length > 0 ? selectedBatches[0] : undefined;
    const courseId = selectedCourses.length > 0 ? selectedCourses[0] : undefined;

    const { data: reviewProjects = initialData, isLoading } = useQuery<ReviewProjectsResponse>({
        queryKey: ["reviewProjects", reviewId, teamId, batchId, courseId],
        queryFn: () => reviewQueries.getReviewProjects(reviewId, teamId, batchId, courseId),
        initialData,
    });

    const projects = reviewProjects.projects;

    const teamOptions = reviewProjects.teams.map((team: TeamFilterInfo) => ({
        label: team.teamName,
        value: team.teamId,
    }));

    const batchOptions = reviewProjects.batches.map((batch: BatchFilterInfo) => ({
        label: batch.batchName,
        value: batch.batchId,
    }));

    const courseOptions = reviewProjects.courses.map((course: CourseFilterInfo) => ({
        label: `${course.courseName} (${course.courseCode})`,
        value: course.courseId,
    }));

    const hasActiveFilters = useMemo(() => {
        return selectedTeams.length > 0 || selectedBatches.length > 0 || selectedCourses.length > 0;
    }, [selectedTeams, selectedBatches, selectedCourses]);

    const handleProjectClick = useCallback(
        (project: ReviewProjectInfoWithIndex) => {
            router.push(`/results/${reviewId}/${project.projectId}`);
        },
        [router, reviewId]
    );

    const handleResetFilters = () => {
        setSelectedTeams([]);
        setSelectedBatches([]);
        setSelectedCourses([]);
    };

    const handleTeamChange = (teams: string[]) => {
        setSelectedTeams(teams.slice(-1));
    };

    const handleBatchChange = (batches: string[]) => {
        setSelectedBatches(batches.slice(-1));
    };

    const handleCourseChange = (courses: string[]) => {
        setSelectedCourses(courses.slice(-1));
    };

    const fieldConfig: GridItemFieldConfig<ReviewProjectInfoWithIndex> = useMemo(
        () => ({
            id: "projectId",
            title: "projectTitle",
        }),
        []
    );

    const getActionsForProject = useCallback(
        (): GridItemAction<ReviewProjectInfoWithIndex>[] => [
            {
                label: "View Results",
                onClick: (project, e) => {
                    e.stopPropagation();
                    router.push(`/results/${reviewId}/${project.projectId}`);
                },
            },
        ],
        [router, reviewId]
    );

    const renderCustomBadge = useCallback(
        (project: ReviewProjectInfoWithIndex) => (
            <div className="flex items-center gap-2 min-w-0">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate" title={project.teamName}>
                    {project.teamName}
                </span>
            </div>
        ),
        []
    );

    const renderCustomContent = useCallback((project: ReviewProjectInfoWithIndex) => {
        return (
            <div className="space-y-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-2">Team Members</p>
                    <div className="flex flex-wrap gap-1">
                        {project.teamMembers.slice(0, 5).map((member) => (
                            <Badge
                                key={member.id}
                                variant="secondary"
                                className="text-xs max-w-32 truncate"
                                title={member.name}
                            >
                                {member.name}
                            </Badge>
                        ))}
                        {project.teamMembers.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                                +{project.teamMembers.length - 5} more
                            </Badge>
                        )}
                    </div>
                </div>
                {project.courseIds.length > 0 && (
                    <div className="pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                            {project.courseIds.length} course
                            {project.courseIds.length !== 1 ? "s" : ""} assigned
                        </p>
                    </div>
                )}
            </div>
        );
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-linear-to-br from-background to-muted/20 rounded-lg border shadow-sm">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Filter Projects</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Narrow down projects by team, batch, or course
                            </p>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-8 gap-2"
                            >
                                <X className="h-4 w-4" />
                                Clear All
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Teams
                            </label>
                            <MultiSelect
                                options={teamOptions}
                                selected={selectedTeams}
                                onChange={handleTeamChange}
                                placeholder="Select team..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Batches
                            </label>
                            <MultiSelect
                                options={batchOptions}
                                selected={selectedBatches}
                                onChange={handleBatchChange}
                                placeholder="Select batch..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Courses
                            </label>
                            <MultiSelect
                                options={courseOptions}
                                selected={selectedCourses}
                                onChange={handleCourseChange}
                                placeholder="Select course..."
                            />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                            <span className="text-sm text-muted-foreground">
                                {projects.length} project
                                {projects.length !== 1 ? "s" : ""} found
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <GridItemSkeleton key={i} />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-2xl opacity-50" />
                            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 border border-border/50">
                                {hasActiveFilters ? (
                                    <SearchX className="h-8 w-8 text-muted-foreground/70" />
                                ) : (
                                    <Folder className="h-8 w-8 text-muted-foreground/70" />
                                )}
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            {hasActiveFilters
                                ? "Try adjusting your filters to see more projects"
                                : "No projects are assigned to this review"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                        <div
                            key={project.projectId}
                            className="animate-in fade-in-0 zoom-in-95 duration-300"
                            style={{
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: "backwards",
                            }}
                        >
                            <GridItem<ReviewProjectInfoWithIndex>
                                item={project as ReviewProjectInfoWithIndex}
                                isSelected={false}
                                onToggleSelect={() => {}}
                                enableSelection={false}
                                onCardClick={handleProjectClick}
                                fieldConfig={fieldConfig}
                                actions={getActionsForProject()}
                                customBadge={renderCustomBadge}
                                customContent={renderCustomContent}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
