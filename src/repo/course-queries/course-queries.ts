import axiosInstance from "@/lib/axios/axios-client";
import { StudentCourse } from "@/types/entities";

export const courseQueries = {
    getActiveCourses: async () => {
        const response = await axiosInstance.get("/api/course/active");
        return response.data;
    },
    getCourseByUserId: async (userId: string) => {
        const response = await axiosInstance.get(`/api/course/${userId}/active-courses`);
        return response.data;
    },
    getCourseByStudentId: async (): Promise<StudentCourse[]> => {
        const response = await axiosInstance.get(`/api/course/student/courses-with-scores`);
        return response.data;
    },
    getCoursePerformance: async (studentId: string, courseId: string) => {
        const response = await axiosInstance.get(
            `/api/course/student/${studentId}/course/${courseId}/review`
        );
        return response.data;
    },
    getCourseById: async (courseId: string) => {
        const response = await axiosInstance.get(`/api/course/${courseId}`);
        return response.data;
    },
    assignBatchesToCourse: async (courseId: string, batchIds: string[]) => {
        const response = await axiosInstance.put(`/api/course/${courseId}/addBatch`, batchIds);
        return response.data;
    },
    removeBatchFromCourse: async (courseId: string, batchId: string) => {
        const response = await axiosInstance.delete(`/api/course/${courseId}/batches/${batchId}`);
        return response.data;
    },
    assignStudentsToCourse: async (courseId: string, studentIds: string[]) => {
        const response = await axiosInstance.post(`/api/course/${courseId}/students`, {
            studentIds,
        });
        return response.data;
    },
    removeStudentFromCourse: async (courseId: string, studentId: string) => {
        const response = await axiosInstance.delete(
            `/api/course/${courseId}/students/${studentId}`
        );
        return response.data;
    },
    getFaculty: async () => {
        const response = await axiosInstance.get("/api/user/faculty");
        return response.data;
    },
    getCourseInstructors: async (courseId: string) => {
        const response = await axiosInstance.get(`/api/course/${courseId}/instructors`);
        return response.data;
    },
    assignInstructorsToCourse: async (courseId: string, instructorIds: string[]) => {
        const response = await axiosInstance.post(`/api/course/${courseId}/instructors`, {
            instructorIds,
        });
        return response.data;
    },
    removeInstructorFromCourse: async (courseId: string, instructorId: string) => {
        const response = await axiosInstance.delete(
            `/api/course/${courseId}/instructors/${instructorId}`
        );
        return response.data;
    },
};
