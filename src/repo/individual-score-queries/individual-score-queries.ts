import axiosInstance from "@/lib/axios/axios-client";
import {
    CourseEvaluationData,
    CourseEvaluationSummary,
    IndividualScoreSubmission,
} from "@/types/features";

const fetchEvaluationSummary = async (
    reviewId: string,
    projectId: string
): Promise<CourseEvaluationSummary> => {
    const response = await axiosInstance.get(
        `/api/individualScore/review/${reviewId}/project/${projectId}/summary`
    );
    return response.data;
};

const fetchCourseEvaluationData = async (
    reviewId: string,
    projectId: string,
    courseId: string
): Promise<CourseEvaluationData> => {
    const response = await axiosInstance.get(
        `/api/individualScore/review/${reviewId}/project/${projectId}/course/${courseId}/data`
    );
    return response.data;
};

const submitCourseScores = async (
    submission: IndividualScoreSubmission
): Promise<IndividualScoreSubmission> => {
    const response = await axiosInstance.post("/api/individualScore/course", submission);
    return response.data;
};

export const individualScoreQueries = {
    fetchEvaluationSummary,
    fetchCourseEvaluationData,
    submitCourseScores,
};
