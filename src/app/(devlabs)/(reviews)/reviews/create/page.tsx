"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { createReviewSchema, CreateReviewSchema } from "@/components/reviews/create-review-schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BasicInfoForm } from "@/components/reviews/basic-info-form";
import { ParticipantsForm } from "@/components/reviews/participants-form";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useSessionContext } from "@/lib/session-context";
import { CreateReviewRequest } from "@/types/features";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function Page() {
    const { user } = useSessionContext();
    const { success, error } = useToast();
    const queryClient = useQueryClient();
    const router = useRouter();

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

    const { mutate: createReview, isPending } = useMutation({
        mutationFn: (data: CreateReviewRequest) => reviewQueries.createReview(data),
        onSuccess: () => {
            success("Review created successfully!");
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
            router.push("/reviews");
        },
        onError: (err) => {
            error(`Failed to create review: ${err.message}`);
        },
    });

    async function onSubmit(data: CreateReviewSchema) {
        if (!user) {
            error("You must be logged in to create a review.");
            return;
        }

        const requestData: CreateReviewRequest = {
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
        createReview(requestData);
    }

    const watchedName = useWatch({ control: form.control, name: "name" });
    const watchedStartDate = useWatch({ control: form.control, name: "startDate" });
    const watchedEndDate = useWatch({ control: form.control, name: "endDate" });
    const watchedRubricId = useWatch({ control: form.control, name: "rubricId" });

    const isBasicInfoComplete =
        watchedName && watchedStartDate && watchedEndDate && watchedRubricId;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Review</h1>
                        <p className="text-muted-foreground mt-1">
                            Set up a new review session for your projects
                        </p>
                    </div>
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
                                onClick={() => router.push("/reviews")}
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
                                        Creating...
                                    </>
                                ) : (
                                    "Create Review"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
