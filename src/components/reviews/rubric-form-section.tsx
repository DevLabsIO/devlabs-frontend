"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Rubric } from "@/types/features";
import rubricQueries from "@/repo/rubrics-queries/rubrics-queries";
import { CreateEditRubricModal } from "@/components/reviews/create-edit-rubric-modal";
import { RubricCriteriaTable } from "@/components/reviews/rubric-criteria-table";
import { useSessionContext } from "@/lib/session-context";
import {
  PlusCircle,
  Pencil,
  AlertCircle,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RubricFormSectionProps {
  selectedRubricId: string | undefined;
  onRubricChange: (id: string | undefined) => void;
}

export function RubricFormSection({
  selectedRubricId,
  onRubricChange,
}: RubricFormSectionProps) {
  const { user } = useSessionContext();
  const queryClient = useQueryClient();
  const { info } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<Rubric | null>(null);

  const {
    data: rubrics,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rubrics", user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve([]);
      return rubricQueries.getUserRubrics(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });

  const handleCreateNew = () => {
    setEditingRubric(null);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedRubricId) {
      info("Please select a rubric to edit.");
      return;
    }
    const rubricToEdit = rubrics?.find((r) => r.id === selectedRubricId);
    if (rubricToEdit) {
      const userCanManage =
        user?.groups &&
        ((user?.groups as string[]).includes("admin") ||
          (user?.groups as string[]).includes("manager"));
      if (rubricToEdit.isShared && !userCanManage) {
        setEditingRubric({
          ...rubricToEdit,
          id: "",
          name: `Copy of ${rubricToEdit.name}`,
          isShared: false,
        });
        info("A new rubric is being created based on the shared rubric.");
      } else {
        setEditingRubric(rubricToEdit);
      }
      setIsModalOpen(true);
    }
  };

  const handleSave = (savedRubric: Rubric) => {
    queryClient.invalidateQueries({ queryKey: ["rubrics", user?.id] });
    onRubricChange(savedRubric.id);
    setIsModalOpen(false);
  };

  const handleSelectRubric = (rubricId: string) => {
    onRubricChange(selectedRubricId === rubricId ? undefined : rubricId);
    setIsSearchPopoverOpen(false);
  };

  const selectedRubric = rubrics?.find((r) => r.id === selectedRubricId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle />
            Error loading rubrics
          </CardTitle>
          <CardDescription>
            There was a problem fetching your rubrics. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Marking Rubric</h3>
        <p className="text-sm text-muted-foreground">
          Select an existing rubric or create a new one
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover
          open={isSearchPopoverOpen}
          onOpenChange={setIsSearchPopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isSearchPopoverOpen}
              className="w-full sm:w-auto flex-1 min-w-[250px] justify-between"
            >
              <span className="truncate">
                {selectedRubric ? selectedRubric.name : "Select a rubric..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search rubrics..." />
              <CommandList>
                <CommandEmpty>No rubric found.</CommandEmpty>
                <CommandGroup>
                  {rubrics?.map((rubric) => (
                    <CommandItem
                      key={rubric.id}
                      value={rubric.name}
                      onSelect={() => handleSelectRubric(rubric.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedRubricId === rubric.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <span className="flex-1 truncate">{rubric.name}</span>
                      {rubric.isShared && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Shared
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleEdit}
            disabled={!selectedRubricId}
            title="Edit or Duplicate Rubric"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit or Duplicate</span>
          </Button>
          <Button variant="outline" onClick={handleCreateNew}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {selectedRubric && (
        <div className="border rounded-lg overflow-hidden">
          <RubricCriteriaTable
            criteria={selectedRubric.criteria}
            onCriteriaChange={() => {}}
            isReadOnly
          />
        </div>
      )}

      <CreateEditRubricModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        existingRubric={editingRubric}
      />
    </div>
  );
}
