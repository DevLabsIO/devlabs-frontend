import axiosInstance from "@/lib/axios/axios-client";
import type { FileUploadResponse, FileListItem, FileListResponse } from "@/types/features";

export type { FileUploadResponse, FileListItem, FileListResponse };

const fileUploadQueries = {
    uploadFile: async (
        file: File,
        onProgress?: (progress: number) => void
    ): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axiosInstance.post("/blob/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    onProgress(progress);
                }
            },
        });

        return response.data;
    },

    deleteFile: async (objectName: string): Promise<{ message: string }> => {
        const response = await axiosInstance.delete("/blob/delete", {
            params: { objectName },
        });
        return response.data;
    },

    listFiles: async (): Promise<FileListResponse> => {
        const response = await axiosInstance.get("/blob/list");
        return response.data;
    },

    getDownloadUrl: async (objectName: string): Promise<{ downloadUrl: string }> => {
        const response = await axiosInstance.get("/blob/file-info", {
            params: { objectName },
        });
        return { downloadUrl: response.data.url };
    },
};

export default fileUploadQueries;
