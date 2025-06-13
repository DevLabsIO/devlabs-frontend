"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Team } from "@/types/types";
import { User } from "@/types/types";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
} from "@/components/teams/types/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";

import { useDebounce } from "@/hooks/use-debounce";
import userQueries from "@/repo/user-queries/user-queries";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

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

export function TeamForm({
  isOpen,
  onClose,
  onSubmit,
  team,
  isLoading,
}: TeamFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { data: session } = useSession();

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      memberIds: team?.members.map((m) => m.id) || [],
    },
    reValidateMode: "onChange",
  });

  const { data: searchedStudents, isLoading: isLoadingSearchedStudents } =
    useQuery({
      queryKey: ["studentSearch", debouncedSearchQuery],
      queryFn: () => {
        return userQueries.searchStudents(debouncedSearchQuery);
      },
      enabled: !!debouncedSearchQuery,
    });

  const memberIds = form.watch("memberIds");
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

  useEffect(() => {
    if (team) {
      const members = team.members.map(
        (m) =>
          ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            image: m.profileImage,
            // Dummy data to satisfy User type
            phoneNumber: "",
            isActive: true,
            createdAt: new Date().toISOString(),
          } as User)
      );
      setSelectedMembers(members);
    } else {
      setSelectedMembers([]);
    }
  }, [team]);

  const students = (debouncedSearchQuery
    ? searchedStudents
    : []) as unknown as User[];
  const listRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: students?.length ?? 0,
    getScrollElement: () => listRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const handleSubmit = (values: TeamFormValues) => {
    if (team) {
      onSubmit(values);
    } else {
      const userId = session?.user?.id;
      if (!userId) {
        // This should not happen in a real-world scenario as the user should be authenticated
        // to access this form. Adding a console error for debugging.
        console.error("User not authenticated, cannot create team.");
        return;
      }
      onSubmit({ ...values, creatorId: userId });
    }
  };

  const handleMemberSelect = (student: User) => {
    const newIds = memberIds.includes(student.id)
      ? memberIds.filter((id) => id !== student.id)
      : [...memberIds, student.id];
    form.setValue("memberIds", newIds, { shouldValidate: true });

    if (newIds.includes(student.id)) {
      setSelectedMembers((prev) => [...prev, student]);
    } else {
      setSelectedMembers((prev) => prev.filter((m) => m.id !== student.id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team" : "Create Team"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
              render={() => (
                <FormItem>
                  <FormLabel>Members</FormLabel>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput
                      placeholder="Search for students..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <div className="p-2 flex flex-wrap gap-1">
                      {selectedMembers.map((member) => (
                        <Badge key={member.id} variant="secondary">
                          {member.name}
                          <button
                            type="button"
                            onClick={() => handleMemberSelect(member)}
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <CommandList
                      ref={listRef}
                      className="max-h-[200px] overflow-auto"
                    >
                      {isLoadingSearchedStudents ? (
                        <div className="flex justify-center items-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : (
                        <>
                          {students && students.length > 0 ? (
                            <CommandGroup
                              style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: "100%",
                                position: "relative",
                              }}
                            >
                              {rowVirtualizer
                                .getVirtualItems()
                                .map((virtualItem) => {
                                  const student = students?.[virtualItem.index];
                                  if (!student) return null;
                                  return (
                                    <CommandItem
                                      key={student.id}
                                      style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: `${virtualItem.size}px`,
                                        transform: `translateY(${virtualItem.start}px)`,
                                      }}
                                      onSelect={() =>
                                        handleMemberSelect(student)
                                      }
                                      value={student.name}
                                      className={cn(
                                        "cursor-pointer",
                                        memberIds.includes(student.id) &&
                                          "bg-accent"
                                      )}
                                    >
                                      {student.name}
                                    </CommandItem>
                                  );
                                })}
                            </CommandGroup>
                          ) : (
                            <CommandEmpty>
                              {debouncedSearchQuery
                                ? "No students found."
                                : "Start typing to search for students."}
                            </CommandEmpty>
                          )}
                        </>
                      )}
                    </CommandList>
                  </Command>
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
