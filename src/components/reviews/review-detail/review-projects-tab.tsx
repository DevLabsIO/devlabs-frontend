"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import reviewQueries from "@/repo/review-queries/review-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Folder, X, Users } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import type {
  ReviewProjectsResponse,
  TeamFilterInfo,
  BatchFilterInfo,
  CourseFilterInfo,
} from "@/types/api";

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

  const { data: reviewProjects = initialData } =
    useQuery<ReviewProjectsResponse>({
      queryKey: ["reviewProjects", reviewId, teamId, batchId, courseId],
      queryFn: () =>
        reviewQueries.getReviewProjects(reviewId, teamId, batchId, courseId),
      initialData,
    });

  const teamOptions = reviewProjects.teams.map((team: TeamFilterInfo) => ({
    label: team.teamName,
    value: team.teamId,
  }));

  const batchOptions = reviewProjects.batches.map((batch: BatchFilterInfo) => ({
    label: batch.batchName,
    value: batch.batchId,
  }));

  const courseOptions = reviewProjects.courses.map(
    (course: CourseFilterInfo) => ({
      label: `${course.courseName} (${course.courseCode})`,
      value: course.courseId,
    }),
  );

  const hasActiveFilters = useMemo(() => {
    return (
      selectedTeams.length > 0 ||
      selectedBatches.length > 0 ||
      selectedCourses.length > 0
    );
  }, [selectedTeams, selectedBatches, selectedCourses]);

  const handleProjectClick = (projectId: string) => {
    router.push(`/results/${reviewId}/${projectId}`);
  };

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

  const virtualizer = useWindowVirtualizer({
    count: reviewProjects.projects.length,
    estimateSize: () => 250,
    overscan: 5,
    getItemKey: (i) => reviewProjects.projects[i]?.projectId ?? i,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [reviewProjects.projects.length, virtualizer]);

  const measureRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) virtualizer.measureElement(el);
    },
    [virtualizer],
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-background to-muted/20 rounded-lg border shadow-sm">
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
              <MultiSelectDropdown
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
              <MultiSelectDropdown
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
              <MultiSelectDropdown
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
                {reviewProjects.projects.length} project
                {reviewProjects.projects.length !== 1 ? "s" : ""} found
              </span>
            </div>
          )}
        </div>
      </div>

      {reviewProjects.projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-sm text-muted-foreground text-center">
              {hasActiveFilters
                ? "Try adjusting your filters to see more projects"
                : "No projects are assigned to this review"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((vi) => {
            const project = reviewProjects.projects[vi.index];
            return (
              <div
                key={project.projectId}
                ref={measureRef}
                data-index={vi.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                <div className="pb-4">
                  <Card
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleProjectClick(project.projectId)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Folder className="h-5 w-5" />
                        {project.projectTitle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {project.teamName}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.teamMembers.map((member) => (
                            <Badge
                              key={member.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {member.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {project.courseIds.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">
                            Courses: {project.courseIds.length}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
