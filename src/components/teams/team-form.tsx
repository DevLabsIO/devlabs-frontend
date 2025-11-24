"use client";
"use no memo";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Team } from "@/types/entities";
import { User } from "@/types/entities";
import { CreateTeamRequest, UpdateTeamRequest } from "@/components/teams/types/types";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";
import { useDebounce } from "@/hooks/use-debounce";
import userQueries from "@/repo/user-queries/user-queries";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext } from "@/lib/session-context";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().optional(),
    memberIds: z.array(z.string()),
});

type TeamFormValues = z.infer<typeof formSchema>;

interface TeamFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTeamRequest | UpdateTeamRequest) => void;
    team?: Team | null;
    isLoading: boolean;
}

/**
 * TeamForm component for creating/editing teams.
 *
 * IMPORTANT: Parent component should provide a `key` prop when rendering this component
 * to ensure proper state reset when switching between create/edit modes:
 * <TeamForm key={team?.id || "new"} ... />
 */
export function TeamForm({ isOpen, onClose, onSubmit, team, isLoading }: TeamFormProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const { session } = useSessionContext();

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: team?.name || "",
            description: team?.description || "",
            memberIds: team?.members.map((m) => m.id) || [],
        },
        reValidateMode: "onChange",
    });

    const { data: searchedStudents, isLoading: isLoadingSearchedStudents } = useQuery({
        queryKey: ["studentSearch", debouncedSearchQuery],
        queryFn: () => {
            return userQueries.searchStudents(debouncedSearchQuery);
        },
        enabled: !!debouncedSearchQuery,
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    });

    const students = (searchedStudents || []) as unknown as User[];

    const studentOptions: OptionType[] = students.map((student) => ({
        label: `${student.name} (${student.email})`,
        value: student.id,
    }));

    const handleSubmit = (values: TeamFormValues) => {
        if (team) {
            onSubmit(values);
        } else {
            const userId = session?.user?.id;
            if (!userId) {
                console.error("User not authenticated, cannot create team.");
                return;
            }
            onSubmit({ ...values, creatorId: userId });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{team ? "Edit Team" : "Create Team"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter team name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Team description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="memberIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Members</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={studentOptions}
                                            selected={field.value}
                                            onChange={(selected) => {
                                                field.onChange(selected);
                                            }}
                                            onSearchChange={setSearchQuery}
                                            placeholder="Search for students..."
                                            emptyMessage={
                                                debouncedSearchQuery
                                                    ? "No students found."
                                                    : "Start typing to search for students."
                                            }
                                            isLoading={
                                                isLoadingSearchedStudents && !!debouncedSearchQuery
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
