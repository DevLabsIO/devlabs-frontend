import { z } from "zod";

export const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Participant = z.infer<typeof participantSchema>;

export const createReviewSchema = z
  .object({
    name: z.string().min(1, { message: "Review name is required." }),
    startDate: z.date({
      required_error: "A start date is required.",
    }),
    endDate: z.date({
      required_error: "An end date is required.",
    }),
    rubricId: z.string().min(1, { message: "A rubric must be selected." }),
    semesters: z.array(participantSchema),
    batches: z.array(participantSchema),
    courses: z.array(participantSchema),
    projects: z.array(participantSchema),
  })
  .refine(
    (data) => {
      const totalParticipants =
        data.semesters.length +
        data.batches.length +
        data.courses.length +
        data.projects.length;
      return totalParticipants > 0;
    },
    {
      message:
        "At least one participant must be selected (semester, batch, course, or project).",
      path: ["semesters"],
    },
  );

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
