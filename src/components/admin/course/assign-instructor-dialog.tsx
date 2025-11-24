"use client";
import React, { useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaculty } from "./hooks/use-faculty";
import { User } from "@/types/entities";

interface AssignInstructorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (instructorIds: string[]) => void;
    isAssigning: boolean;
    courseId: string;
}

export function AssignInstructorDialog({
    isOpen,
    onClose,
    onAssign,
    isAssigning,
}: AssignInstructorDialogProps) {
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    const { data: instructors, isLoading } = useFaculty(isOpen);

    const instructorOptions = useMemo(() => {
        return (instructors || []).map((instructor: User) => ({
            label: instructor.name,
            value: instructor.id,
        }));
    }, [instructors]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedInstructors([]);
                    onClose();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Instructors</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-28" />
                            </div>
                        </div>
                    ) : (
                        <MultiSelect
                            options={instructorOptions}
                            selected={selectedInstructors}
                            onChange={setSelectedInstructors}
                            placeholder="Select instructors"
                        />
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isAssigning}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onAssign(selectedInstructors)}
                        disabled={isAssigning || selectedInstructors.length === 0}
                    >
                        {isAssigning ? "Assigning..." : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
