"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rubric, RubricCriterionData, UpdateRubricRequest } from "@/types/features";
import { RubricCriteriaTable } from "./rubric-criteria-table";
import { useMutation } from "@tanstack/react-query";
import rubricQueries from "@/repo/rubrics-queries/rubrics-queries";
import { useToast } from "@/hooks/use-toast";
import { useSessionContext } from "@/lib/session-context";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface CreateEditRubricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rubric: Rubric) => void;
    existingRubric?: Rubric | null;
}

/**
 * CreateEditRubricModal component for creating/editing rubrics.
 *
 * IMPORTANT: Parent component should provide a `key` prop when rendering this component
 * to ensure proper state reset when switching between create/edit modes:
 * <CreateEditRubricModal key={existingRubric?.id || "new"} ... />
 */
export function CreateEditRubricModal({
    isOpen,
    onClose,
    onSave,
    existingRubric,
}: CreateEditRubricModalProps) {
    const { user, session } = useSessionContext();
    const { success, error } = useToast();
    const [name, setName] = useState(existingRubric?.name || "");
    const [isShared, setIsShared] = useState(existingRubric?.isShared || false);
    const [criteria, setCriteria] = useState<RubricCriterionData[]>(
        existingRubric?.criteria.map(({ id: _id, ...rest }) => rest) || []
    );

    const userGroups = session?.user?.groups as string[] | undefined;
    const userCanShare =
        userGroups && (userGroups.includes("admin") || userGroups.includes("manager"));

    const { mutate: createRubric, isPending: isCreating } = useMutation({
        mutationFn: rubricQueries.createRubric,
        onSuccess: (data) => {
            success("Rubric created successfully");
            onSave(data);
            onClose();
        },
        onError: (err) => {
            error("Failed to create rubric", { description: err.message });
        },
    });

    const { mutate: updateRubric, isPending: isUpdating } = useMutation({
        mutationFn: (data: { id: string; payload: UpdateRubricRequest }) =>
            rubricQueries.updateRubric(data.id, data.payload),
        onSuccess: (data) => {
            success("Rubric updated successfully");
            onSave(data);
            onClose();
        },
        onError: (err) => {
            error("Failed to update rubric", { description: err.message });
        },
    });

    const handleSave = () => {
        if (!user) {
            error("You must be logged in to save a rubric.");
            return;
        }
        if (!name.trim()) {
            error("Rubric name is required.");
            return;
        }
        if (criteria.some((c) => !c.name.trim())) {
            error("All criteria must have a name.");
            return;
        }
        if (criteria.length === 0) {
            error("A rubric must have at least one criterion.");
            return;
        }

        const rubricData = {
            name,
            userId: user.id,
            isShared: userCanShare ? isShared : false,
            criteria,
        };

        if (existingRubric) {
            updateRubric({ id: existingRubric.id, payload: rubricData });
        } else {
            createRubric(rubricData);
        }
    };

    const isSaving = isCreating || isUpdating;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[120vh] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {existingRubric ? "Edit Rubric" : "Create New Rubric"}
                    </DialogTitle>
                    <DialogDescription>
                        {existingRubric
                            ? "Edit the details of your rubric."
                            : "Create a new rubric for evaluating reviews."}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 flex-1 overflow-y-auto pr-6">
                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-5"
                            placeholder="e.g. Final Project Evaluation"
                        />
                    </div>
                    {userCanShare && (
                        <div className="grid grid-cols-6 items-center gap-4">
                            <Label htmlFor="isShared" className="text-right">
                                Sharing
                            </Label>
                            <div className="col-span-5">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsShared((prev) => !prev)}
                                    className={cn(
                                        "w-[150px] justify-start",
                                        isShared &&
                                            "border-green-600 text-green-600 hover:text-green-700"
                                    )}
                                >
                                    {isShared ? (
                                        <Check className="mr-2 h-4 w-4" />
                                    ) : (
                                        <X className="mr-2 h-4 w-4" />
                                    )}
                                    {isShared ? "Shared" : "Not Shared"}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div>
                        <Label className="text-lg font-semibold">Criteria</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                            Define the criteria for this rubric. The total score will be calculated
                            automatically.
                        </p>
                        <RubricCriteriaTable criteria={criteria} onCriteriaChange={setCriteria} />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSaving}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                    >
                        {isSaving ? "Saving..." : "Save Rubric"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
