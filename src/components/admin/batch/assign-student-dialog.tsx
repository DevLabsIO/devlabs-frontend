"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useAssignStudentsToBatch } from "./hooks/use-batch";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { useQuery } from "@tanstack/react-query";
import batchQueries from "@/repo/batch-queries/batch-queries";
import { User } from "@/types/entities";

interface AssignStudentToBatchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: string;
    onSuccess: () => void;
}

export function AssignStudentToBatchDialog({
    isOpen,
    onClose,
    batchId,
    onSuccess,
}: AssignStudentToBatchDialogProps) {
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const { success, error } = useToast();

    const { data: availableStudents = [], isLoading } = useQuery({
        queryKey: ["availableStudents", batchId, debouncedSearchQuery],
        queryFn: () => batchQueries.getAvailableStudents(batchId, debouncedSearchQuery),
        enabled: isOpen,
    });

    const assignMutation = useAssignStudentsToBatch();

    const handleClose = () => {
        setSelectedStudents([]);
        setSearchQuery("");
        onClose();
    };

    const handleAssign = () => {
        assignMutation.mutate(
            { batchId, userIds: selectedStudents },
            {
                onSuccess: () => {
                    success("Students assigned successfully");
                    setSelectedStudents([]);
                    setSearchQuery("");
                    onSuccess();
                    onClose();
                },
                onError: (err) => {
                    error(err.message || "Failed to assign students");
                },
            }
        );
    };

    const studentOptions: OptionType[] = availableStudents.map((student: User) => ({
        value: student.id,
        label: `${student.name} (${student.email})`,
    }));

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Students to Batch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <MultiSelect
                        options={studentOptions}
                        selected={selectedStudents}
                        onChange={setSelectedStudents}
                        placeholder="Search and select students..."
                        emptyMessage="No available students found."
                        isLoading={isLoading}
                        onSearchChange={setSearchQuery}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={assignMutation.isPending || selectedStudents.length === 0}
                    >
                        {assignMutation.isPending ? "Assigning..." : "Assign"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
