"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import batchQueries from "@/repo/batch-queries/batch-queries";
import { Batch } from "@/types/entities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAllDepartments } from "@/components/admin/department/hooks/use-department";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

interface BatchFormData {
    name: string;
    joinYear: number;
    section: string;
    isActive: boolean;
    departmentId: string;
}

interface BatchDialogProps {
    batch?: Batch;
    isOpen?: boolean;
    onClose?: (open: boolean) => void;
    mode?: "create" | "edit";
}

export function BatchDialog({
    batch,
    isOpen: controlledIsOpen,
    onClose,
    mode = "create",
}: BatchDialogProps) {
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
    const isOpen = controlledIsOpen ?? uncontrolledIsOpen;
    const setIsOpen = onClose ?? setUncontrolledIsOpen;
    const queryClient = useQueryClient();
    const toast = useToast();

    const initialFormData: BatchFormData =
        batch && mode === "edit"
            ? {
                  name: batch.name ?? "",
                  joinYear: batch.joinYear ?? new Date().getFullYear(),
                  section: batch.section ?? "",
                  isActive: batch.isActive ?? true,
                  departmentId: batch.department?.id ?? "",
              }
            : {
                  name: "",
                  joinYear: new Date().getFullYear(),
                  section: "",
                  isActive: true,
                  departmentId: "",
              };

    const [formData, setFormData] = useState<BatchFormData>(initialFormData);

    const {
        data: departments = [],
        isLoading: isLoadingDepartments,
        refetch,
    } = useAllDepartments({ enabled: false });

    useEffect(() => {
        if (isOpen) {
            refetch();
        }
    }, [isOpen, refetch]);

    const resetForm = () => {
        setFormData({
            name: "",
            joinYear: new Date().getFullYear(),
            section: "",
            isActive: true,
            departmentId: "",
        });
    };

    const computedBatchName = (() => {
        if (mode === "create" && formData.joinYear && formData.departmentId && formData.section) {
            const department = departments.find((d) => d.id === formData.departmentId);
            if (department) {
                return `${formData.joinYear}${department.name}${formData.section}`;
            }
        }
        return formData.name;
    })();

    const currentFormData = mode === "create" ? { ...formData, name: computedBatchName } : formData;

    const { mutate: createBatch, isPending: isCreating } = useMutation({
        mutationFn: (data: BatchFormData) => {
            return batchQueries.createBatch(data);
        },
        onSuccess: () => {
            toast.success("Batch created successfully!");
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            resetForm();
            setIsOpen(false);
        },
        onError: (error: Error) => {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
                error.message ||
                "Failed to create batch";
            toast.error(errorMessage);
        },
    });

    const { mutate: updateBatch, isPending: isUpdating } = useMutation({
        mutationFn: (data: BatchFormData & { id: string }) => {
            return batchQueries.updateBatch(data);
        },
        onSuccess: () => {
            toast.success("Batch updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["batches"] });
            setIsOpen(false);
        },
        onError: (error: Error) => {
            const errorMessage =
                (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
                error.message ||
                "Failed to update batch";
            toast.error(errorMessage);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "create") {
            createBatch(currentFormData);
        } else if (mode === "edit" && batch) {
            updateBatch({ ...currentFormData, id: batch.id });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={mode === "create" ? "default" : "outline"}>
                    {mode === "create" && <Plus className="mr-2 h-4 w-4" />}
                    {mode === "create" ? "Add Batch" : "Edit Batch"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add New Batch" : "Edit Batch"}</DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Fill in the details to create a new batch."
                            : "Update the batch information."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Batch Name Preview (Auto-generated) */}
                    {mode === "create" && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Batch Name (Auto-generated)
                            </Label>
                            <div className="px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {computedBatchName || "Enter join year, department, and section"}
                            </div>
                            <p className="text-xs text-gray-500">
                                Generated from: Join Year + Department + Section
                            </p>
                        </div>
                    )}

                    {/* Join Year */}
                    <div className="space-y-2">
                        <Label htmlFor="joinYear">Join Year</Label>
                        <InputNumber
                            id="joinYear"
                            value={formData.joinYear}
                            onChange={(value) =>
                                setFormData({
                                    ...formData,
                                    joinYear: value || new Date().getFullYear(),
                                })
                            }
                            min={new Date().getFullYear() - 10}
                            max={new Date().getFullYear() + 5}
                            placeholder="Enter join year"
                            required
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="departmentId">Department</Label>
                        <Select
                            value={formData.departmentId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, departmentId: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingDepartments ? (
                                    <div className="p-2">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full mt-2" />
                                        <Skeleton className="h-8 w-full mt-2" />
                                    </div>
                                ) : (
                                    departments?.map((department) => (
                                        <SelectItem key={department.id} value={department.id}>
                                            {department.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Section */}
                    <div className="space-y-2">
                        <Label htmlFor="section">Section</Label>
                        <Input
                            id="section"
                            value={formData.section}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            placeholder="Enter section (e.g., A, B, C)"
                            required
                        />
                    </div>

                    {/* Batch Name (for edit mode only) */}
                    {mode === "edit" && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Batch Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled
                            />
                            <p className="text-xs text-gray-500">
                                Batch name is auto-generated and cannot be edited directly
                            </p>
                        </div>
                    )}

                    {/* Active Status */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isActive: checked })
                            }
                        />
                        <Label htmlFor="isActive">Active</Label>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isCreating || isUpdating}>
                            {mode === "create" ? "Create Batch" : "Update Batch"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
