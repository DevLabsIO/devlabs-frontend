"use client";

import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreateReviewSchema, Participant } from "./create-review-schema";
import rubricQueries from "@/repo/rubrics-queries/rubrics-queries";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Rubric } from "@/types/features";
import {
  Calendar,
  Clock,
  FileText,
  Users,
  BookOpen,
  Folder,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function SummarySection({
  title,
  items,
  renderItem,
  icon,
  colorClass,
}: {
  title: string;
  items: Participant[] | undefined;
  renderItem: (item: Participant) => React.ReactNode;
  icon: React.ReactNode;
  colorClass: string;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <Badge variant="secondary" className="ml-auto">
          {items.length}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge
            key={item.id}
            variant="outline"
            className="px-3 py-1.5 text-sm"
          >
            {renderItem(item)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function ReviewSummary() {
  const { getValues } = useFormContext<CreateReviewSchema>();
  const values = getValues();

  const { data: rubric, isLoading: isLoadingRubric } = useQuery<Rubric>({
    queryKey: ["rubric", values.rubricId],
    queryFn: () => rubricQueries.getRubricById(values.rubricId!),
    enabled: !!values.rubricId,
  });

  if (isLoadingRubric) {
    return <Skeleton className="h-64 w-full" />;
  }

  const { name, startDate, endDate, semesters, batches, courses, projects } =
    values;

  const allParticipantsEmpty =
    (!semesters || semesters.length === 0) &&
    (!batches || batches.length === 0) &&
    (!courses || courses.length === 0) &&
    (!projects || projects.length === 0);

  const isComplete = name && startDate && endDate && values.rubricId;

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div
        className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
          isComplete
            ? "bg-green-50 dark:bg-green-950/20 border-green-500"
            : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500"
        }`}
      >
        {isComplete ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-100">
                Ready to Submit
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                All required fields are filled
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                Incomplete Information
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Please complete all required fields
              </p>
            </div>
          </>
        )}
      </div>

      {/* Review Details */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-slate-600" />
            <h3 className="font-bold text-lg">Review Details</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Review Name
              </p>
              <p className="font-semibold text-lg">
                {name || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <p className="text-xs font-medium text-muted-foreground">
                    Start Date
                  </p>
                </div>
                <p className="font-semibold">
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-medium text-muted-foreground">
                    End Date
                  </p>
                </div>
                <p className="font-semibold">
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span className="text-muted-foreground italic">
                      Not set
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Marking Rubric
              </p>
              <p className="font-semibold">
                {rubric?.name ?? (
                  <span className="text-muted-foreground italic">
                    Not selected
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-lg">Participants</h3>
          </div>

          {allParticipantsEmpty ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                No participants selected
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                This review will not be assigned to anyone
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <SummarySection
                title="Semesters"
                items={semesters}
                renderItem={(item) => <>{item.name}</>}
                icon={<Calendar className="h-4 w-4 text-white" />}
                colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <SummarySection
                title="Batches"
                items={batches}
                renderItem={(item) => <>{item.name}</>}
                icon={<Users className="h-4 w-4 text-white" />}
                colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600"
              />
              <SummarySection
                title="Courses"
                items={courses}
                renderItem={(item) => <>{item.name}</>}
                icon={<BookOpen className="h-4 w-4 text-white" />}
                colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <SummarySection
                title="Projects"
                items={projects}
                renderItem={(item) => <>{item.name}</>}
                icon={<Folder className="h-4 w-4 text-white" />}
                colorClass="bg-gradient-to-br from-cyan-500 to-cyan-600"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
