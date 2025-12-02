"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { createReviewSchema, CreateReviewSchema } from "@/components/reviews/create-review-schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState, useEffect, useRef, useCallback } from "react";
import { BasicInfoForm } from "@/components/reviews/basic-info-form";
import { ParticipantsForm } from "@/components/reviews/participants-form";
import { Loader2 } from "lucide-react";
import { DevTool } from "@hookform/devtools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useSessionContext } from "@/lib/session-context";
import {
    UpdateReviewRequest,
    SemesterResponse,
    BatchResponse,
    ProjectResponse,
} from "@/types/features";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { Course } from "@/types/entities";
import semesterQueries from "@/repo/semester-queries/semester-queries";
import batchQueries from "@/repo/batch-queries/batch-queries";
import { courseQueries } from "@/repo/course-queries/course-queries";
import { projectQueries } from "@/repo/project-queries/project-queries";

export default function EditReviewPage() {
    const [isFormReady, setIsFormReady] = useState(false);
    const params = useParams();
    const router = useRouter();
    const reviewId = params.id as string;
    const { user } = useSessionContext();
    const { success, error } = useToast();
    const queryClient = useQueryClient();
    const hasInitialized = useRef(false);

    const { data: review, isLoading: isLoadingReview } = useQuery({
        queryKey: ["review", reviewId],
        queryFn: () => reviewQueries.getReviewById(reviewId),
        enabled: !!reviewId,
    });

    // Fetch reference data for mapping IDs to names
    const { data: allSemesters } = useQuery<SemesterResponse[]>({
        queryKey: ["activeSemesters"],
        queryFn: semesterQueries.getActiveSemesters,
        staleTime: 10 * 60 * 1000,
    });

    const { data: allBatches } = useQuery<BatchResponse[]>({
        queryKey: ["activeBatches"],
        queryFn: batchQueries.getActiveBatches,
        staleTime: 10 * 60 * 1000,
    });

    const { data: allCourses } = useQuery<Course[]>({
        queryKey: ["activeCourses"],
        queryFn: courseQueries.getActiveCourses,
        staleTime: 10 * 60 * 1000,
    });

    const { data: allProjects } = useQuery<ProjectResponse[]>({
        queryKey: ["activeProjects"],
        queryFn: projectQueries.getActiveProjects,
        staleTime: 10 * 60 * 1000,
    });

    const form = useForm<CreateReviewSchema>({
        resolver: zodResolver(createReviewSchema),
        mode: "onTouched",
        defaultValues: {
            name: "",
            startDate: undefined,
            endDate: undefined,
            rubricId: undefined,
            semesters: [],
            batches: [],
            courses: [],
            projects: [],
        },
    });

    const initializeForm = useCallback(() => {
        if (!review || hasInitialized.current) return;
        if (!allSemesters || !allBatches || !allCourses || !allProjects) return;

        hasInitialized.current = true;

        const semesterMap = new Map(allSemesters.map((s: SemesterResponse) => [s.id, s]));
        const batchMap = new Map(allBatches.map((b: BatchResponse) => [b.id, b]));
        const courseMap = new Map(allCourses.map((c: Course) => [c.id, c]));
        const projectMap = new Map(allProjects.map((p: ProjectResponse) => [p.id, p]));

        const semesters = (review.semesterIds || [])
            .map((id: string) => {
                const semester = semesterMap.get(id);
                return semester
                    ? { id: semester.id, name: `${semester.name} - ${semester.year}` }
                    : null;
            })
            .filter(Boolean) as { id: string; name: string }[];

        const batches = (review.batchIds || [])
            .map((id: string) => {
                const batch = batchMap.get(id);
                return batch
                    ? { id: batch.id, name: `${batch.name} - ${batch.department?.name || "N/A"}` }
                    : null;
            })
            .filter(Boolean) as { id: string; name: string }[];

        const courses = (review.courseIds || [])
            .map((id: string) => {
                const course = courseMap.get(id);
                return course ? { id: course.id, name: `${course.name} (${course.code})` } : null;
            })
            .filter(Boolean) as { id: string; name: string }[];

        const projects = (review.projectIds || [])
            .map((id: string) => {
                const project = projectMap.get(id);
                return project ? { id: project.id, name: project.title } : null;
            })
            .filter(Boolean) as { id: string; name: string }[];

        requestAnimationFrame(() => {
            form.reset({
                name: review.name || "",
                startDate: review.startDate ? parseISO(review.startDate) : undefined,
                endDate: review.endDate ? parseISO(review.endDate) : undefined,
                rubricId: review.rubricsInfo?.id || undefined,
                semesters,
                batches,
                courses,
                projects,
            });
            requestAnimationFrame(() => {
                setIsFormReady(true);
            });
        });
    }, [review, allSemesters, allBatches, allCourses, allProjects, form]);

    useEffect(() => {
        initializeForm();
    }, [initializeForm]);

    const { mutate: updateReview, isPending } = useMutation({
        mutationFn: (data: UpdateReviewRequest) => reviewQueries.updateReview(reviewId, data),
        onSuccess: () => {
            success("Review updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
            router.push(`/reviews/${reviewId}`);
        },
        onError: (err) => {
            error(`Failed to update review: ${err.message}`);
        },
    });

    async function onSubmit(data: CreateReviewSchema) {
        if (!user) {
            error("You must be logged in to update a review.");
            return;
        }

        const requestData: UpdateReviewRequest = {
            name: data.name,
            startDate: format(data.startDate, "yyyy-MM-dd"),
            endDate: format(data.endDate, "yyyy-MM-dd"),
            rubricsId: data.rubricId,
            userId: user.id,
            semesterIds: data.semesters.map((s) => s.id),
            batchIds: data.batches.map((b) => b.id),
            courseIds: data.courses.map((c) => c.id),
            projectIds: data.projects.map((p) => p.id),
        };
        updateReview(requestData);
    }

    const watchedName = useWatch({ control: form.control, name: "name" });
    const watchedStartDate = useWatch({ control: form.control, name: "startDate" });
    const watchedEndDate = useWatch({ control: form.control, name: "endDate" });
    const watchedRubricId = useWatch({ control: form.control, name: "rubricId" });

    const isBasicInfoComplete =
        watchedName && watchedStartDate && watchedEndDate && watchedRubricId;

    if (isLoadingReview || !isFormReady) {
        return (
            <div className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-64">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading review...</span>
                </div>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Review not found</h1>
                    <p className="text-muted-foreground mt-2">
                        The review you&apos;re looking for doesn&apos;t exist or has been deleted.
                    </p>
                    <Button onClick={() => router.push("/reviews")} className="mt-4">
                        Back to Reviews
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Edit Review</h1>
                    <p className="text-muted-foreground">
                        Update the details of &quot;{review.name}&quot;
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                        <BasicInfoForm />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-background px-4 text-muted-foreground font-medium">
                                    Participants
                                </span>
                            </div>
                        </div>

                        <ParticipantsForm />

                        <div className="flex items-center justify-between pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/reviews/${reviewId}`)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !isBasicInfoComplete}
                                size="lg"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Review"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
                {process.env.NODE_ENV === "development" && <DevTool control={form.control} />}
            </div>
        </div>
    );
}
