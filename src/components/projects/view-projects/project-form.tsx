import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Course, Project } from "@/types/entities";
import { CreateProjectRequest } from "@/components/projects/types/types";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { useQuery } from "@tanstack/react-query";

interface ProjectFormProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectRequest) => void;
  isLoading: boolean;
  project?: Project | null;
  teamId: string;
}

export function ProjectForm({
  userId,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  project,
  teamId,
}: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  useEffect(() => {
    setTitle(project?.title || "");
    setDescription(project?.description || "");
    setObjectives(project?.objectives || "");
    setSelectedCourseIds(
      Array.isArray(project?.courseIds) ? project?.courseIds : [],
    );
  }, [project, isOpen]);

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => courseQueries.getCourseByUserId(userId),
    enabled: isOpen,
    refetchOnMount: true,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const courseOptions: OptionType[] =
    courses?.map((course: Course) => ({
      value: course.id,
      label: course.name,
    })) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      objectives,
      teamId,
      courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Project" : "Create Project"}
          </DialogTitle>
          <DialogDescription>
            {project
              ? "Edit the project details."
              : "Fill in the form to create a new project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              placeholder="Project description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Objectives</label>
            <Textarea
              placeholder="Project objectives"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Courses (Multi-select)
            </label>
            <MultiSelect
              options={courseOptions}
              selected={selectedCourseIds}
              onChange={setSelectedCourseIds}
              placeholder="Select courses"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
