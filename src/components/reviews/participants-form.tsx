"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import semesterQueries from "@/repo/semester-queries/semester-queries";
import batchQueries from "@/repo/batch-queries/batch-queries";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { projectQueries } from "@/repo/project-queries/project-queries";
import { BatchResponse, ProjectResponse, SemesterResponse } from "@/types/features";
import { Course } from "@/types/entities";
import { Participant, CreateReviewSchema } from "@/components/reviews/create-review-schema";
import { MultiSelect, OptionType } from "@/components/ui/multi-select";

interface ParticipantSelectorProps<T> {
    queryKey: string[];
    queryFn: () => Promise<T[]>;
    itemKey: keyof CreateReviewSchema;
    optionsTransformer: (data: T[]) => Participant[];
    placeholder: string;
}

function ParticipantSelector<T>({
    queryKey,
    queryFn,
    itemKey,
    optionsTransformer,
    placeholder,
}: ParticipantSelectorProps<T>) {
    const { control, setValue } = useFormContext<CreateReviewSchema>();
    const selectedItems = useWatch({
        control,
        name: itemKey,
        defaultValue: [],
    }) as Participant[];

    const { data, isLoading } = useQuery<T[]>({
        queryKey,
        queryFn,
        staleTime: 10 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
    });

    const options: OptionType[] = data
        ? optionsTransformer(data).map((item) => ({
              label: item.name,
              value: item.id,
          }))
        : [];

    const selectedValues = selectedItems.map((item) => item.id);

    const handleChange = (values: string[]) => {
        const participantMap = new Map(data ? optionsTransformer(data).map((p) => [p.id, p]) : []);
        const newItems = values
            .map((id) => participantMap.get(id))
            .filter(Boolean) as Participant[];
        setValue(itemKey, newItems, { shouldDirty: true, shouldValidate: true });
    };

    if (isLoading) {
        return (
            <div className="space-y-2 p-2">
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    return (
        <MultiSelect
            options={options}
            selected={selectedValues}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full"
        />
    );
}

export function ParticipantsForm() {
    const { formState } = useFormContext<CreateReviewSchema>();
    const semesterError = formState.errors.semesters?.message;

    return (
        <div className="space-y-6">
            {semesterError && (
                <div className="text-sm text-destructive font-medium">{semesterError}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Semesters</h3>
                    <ParticipantSelector<SemesterResponse>
                        queryKey={["activeSemesters"]}
                        queryFn={semesterQueries.getActiveSemesters}
                        itemKey="semesters"
                        optionsTransformer={(data) =>
                            data.map((s) => ({ id: s.id, name: `${s.name} - ${s.year}` }))
                        }
                        placeholder="Search semesters..."
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Batches</h3>
                    <ParticipantSelector<BatchResponse>
                        queryKey={["activeBatches"]}
                        queryFn={batchQueries.getActiveBatches}
                        itemKey="batches"
                        optionsTransformer={(data) =>
                            data.map((b) => ({
                                id: b.id,
                                name: `${b.name} - ${b.department?.name || "N/A"}`,
                            }))
                        }
                        placeholder="Search batches..."
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Courses</h3>
                    <ParticipantSelector<Course>
                        queryKey={["activeCourses"]}
                        queryFn={courseQueries.getActiveCourses}
                        itemKey="courses"
                        optionsTransformer={(data) =>
                            data.map((c) => ({ id: c.id, name: `${c.name} (${c.code})` }))
                        }
                        placeholder="Search courses..."
                    />
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Projects</h3>
                    <ParticipantSelector<ProjectResponse>
                        queryKey={["activeProjects"]}
                        queryFn={projectQueries.getActiveProjects}
                        itemKey="projects"
                        optionsTransformer={(data) =>
                            data.map((p) => ({ id: p.id, name: p.title }))
                        }
                        placeholder="Search projects..."
                    />
                </div>
            </div>
        </div>
    );
}
