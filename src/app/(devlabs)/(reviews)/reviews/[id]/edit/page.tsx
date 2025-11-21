"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createReviewSchema,
  CreateReviewSchema,
} from "@/components/reviews/create-review-schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { BasicInfoForm } from "@/components/reviews/basic-info-form";
import { ParticipantsForm } from "@/components/reviews/participants-form";
import { ReviewSummary } from "@/components/reviews/review-summary";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { DevTool } from "@hookform/devtools";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import reviewQueries from "@/repo/review-queries/review-queries";
import { useSessionContext } from "@/lib/session-context";
import { UpdateReviewRequest } from "@/types/features";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { Review } from "@/types/entities";

const formSteps = [
  { value: "basic-info", label: "Basic Info" },
  { value: "participants", label: "Participants" },
  { value: "summary", label: "Summary" },
];

export default function EditReviewPage() {
  const [currentTab, setCurrentTab] = useState(formSteps[0].value);
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;
  const { user } = useSessionContext();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  const { data: review, isLoading: isLoadingReview } = useQuery({
    queryKey: ["review", reviewId],
    queryFn: () => reviewQueries.getReviewById(reviewId),
    enabled: !!reviewId,
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

  useEffect(() => {
    if (review) {
      interface SemesterOption {
        id: string;
        name: string;
      }

      const semesters =
        review.courses?.map(
          (course: Review["courses"][0]) =>
            ({
              id: course.semesterInfo.id,
              name: course.semesterInfo.name,
            }) as SemesterOption,
        ) || [];

      const uniqueSemesters = semesters.filter(
        (semester: SemesterOption, index: number, self: SemesterOption[]) =>
          index === self.findIndex((s: SemesterOption) => s.id === semester.id),
      );

      form.reset({
        name: review.name || "",
        startDate: review.startDate ? parseISO(review.startDate) : undefined,
        endDate: review.endDate ? parseISO(review.endDate) : undefined,
        rubricId: review.rubricsInfo?.id || undefined,
        semesters: uniqueSemesters,
        batches: [],
        courses:
          review.courses?.map((course: Review["courses"][0]) => ({
            id: course.id,
            name: course.name,
          })) || [],
        projects:
          review.projects?.map((project: Review["projects"][0]) => ({
            id: project.id,
            name: project.title,
          })) || [],
      });
    }
  }, [review, form]);

  const { mutate: updateReview, isPending } = useMutation({
    mutationFn: (data: UpdateReviewRequest) =>
      reviewQueries.updateReview(reviewId, data),
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

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateReviewSchema)[] = [];
    if (currentTab === "basic-info") {
      fieldsToValidate = ["name", "startDate", "endDate", "rubricId"];
    } else if (currentTab === "participants") {
      fieldsToValidate = ["semesters"]; // Only validate required fields
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (!isValid) return;

    const currentIndex = formSteps.findIndex(
      (step) => step.value === currentTab,
    );
    if (currentIndex < formSteps.length - 1) {
      setCurrentTab(formSteps[currentIndex + 1].value);
    }
  };

  const handlePrevious = () => {
    const currentIndex = formSteps.findIndex(
      (step) => step.value === currentTab,
    );
    if (currentIndex > 0) {
      setCurrentTab(formSteps[currentIndex - 1].value);
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case "basic-info":
        return <BasicInfoForm />;
      case "participants":
        return <ParticipantsForm />;
      case "summary":
        return <ReviewSummary />;
      default:
        return null;
    }
  };

  if (isLoadingReview) {
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
            The review you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button onClick={() => router.push("/reviews")} className="mt-4">
            Back to Reviews
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Edit Review</h1>
        <p className="text-muted-foreground">
          Update the details of &quot;{review.name}&quot;
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {formSteps.map((step) => (
                <TabsTrigger
                  key={step.value}
                  value={step.value}
                  onClick={() => setCurrentTab(step.value)}
                >
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Card>
              <CardHeader>
                <CardTitle>
                  {formSteps.find((s) => s.value === currentTab)?.label}
                </CardTitle>
                <CardDescription>
                  {currentTab === "basic-info" &&
                    "Update the basic details of the review."}
                  {currentTab === "participants" &&
                    "Modify the participants for this review."}
                  {currentTab === "summary" &&
                    "Review all the changes before updating the review."}
                </CardDescription>
              </CardHeader>
              <CardContent>{renderContent()}</CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentTab === formSteps[0].value || isPending}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {currentTab !== "summary" ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isPending}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Update Review
                  </Button>
                )}
              </CardFooter>
            </Card>
          </Tabs>
        </form>
      </Form>
      {process.env.NODE_ENV === "development" && (
        <DevTool control={form.control} />
      )}
    </div>
  );
}
