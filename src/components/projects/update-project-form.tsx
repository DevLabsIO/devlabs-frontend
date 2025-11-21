"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { ProjectWithTeam } from "@/types/entities";
import { Edit3, Save, X } from "lucide-react";

interface UpdateProjectFormProps {
  project: ProjectWithTeam;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title?: string;
    description?: string;
    objectives?: string;
    githubUrl?: string;
  }) => void;
  isLoading: boolean;
}

export function UpdateProjectForm({
  project,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: UpdateProjectFormProps) {
  const [formData, setFormData] = useState({
    title: project.title || "",
    description: project.description || "",
    objectives: project.objectives || "",
    githubUrl: project.githubUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: {
      title?: string;
      description?: string;
      objectives?: string;
      githubUrl?: string;
    } = {};
    if (formData.title !== project.title) updates.title = formData.title;
    if (formData.description !== project.description)
      updates.description = formData.description;
    if (formData.objectives !== project.objectives)
      updates.objectives = formData.objectives;
    if (formData.githubUrl !== project.githubUrl)
      updates.githubUrl = formData.githubUrl;

    if (Object.keys(updates).length > 0) {
      onSubmit(updates);
    } else {
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Update Project
          </DialogTitle>
          <DialogDescription>
            Update your project details. Only modified fields will be updated.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter project description"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objectives</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={(e) => handleChange("objectives", e.target.value)}
                placeholder="Enter project objectives"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleChange("githubUrl", e.target.value)}
                placeholder="https://github.com/your-repo"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
