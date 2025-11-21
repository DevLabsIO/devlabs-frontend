import axiosInstance from "@/lib/axios/axios-client";
import type {
    FileUploadResponse,
    FileListItem,
    FileListResponse,
    FileUploadParams,
    FileListParams,
} from "@/types/features";

export type {
    FileUploadResponse,
    FileListItem,
    FileListResponse,
    FileUploadParams,
    FileListParams,
};

const fileUploadQueries = {
    uploadFile: async (
        params: FileUploadParams,
        onProgress?: (progress: number) => void
    ): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append("file", params.file);

        if (params.customName) {
            formData.append("customName", params.customName);
        }
        if (params.teamId) {
            formData.append("teamId", params.teamId);
        }
        if (params.teamName) {
            formData.append("teamName", params.teamName);
        }
        if (params.projectId) {
            formData.append("projectId", params.projectId);
        }
        if (params.projectName) {
            formData.append("projectName", params.projectName);
        }
        if (params.reviewId) {
            formData.append("reviewId", params.reviewId);
        }
        if (params.reviewName) {
            formData.append("reviewName", params.reviewName);
        }

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

    listFiles: async (params: FileListParams): Promise<FileListResponse> => {
        const response = await axiosInstance.get("/blob/list", {
            params,
        });
        return response.data;
    },

    getDownloadUrl: async (objectName: string): Promise<{ downloadUrl: string }> => {
        const response = await axiosInstance.get("/blob/file-info", {
            params: { objectName },
        });
        return { downloadUrl: response.data.url };
    },

    constructMinioUrl: (objectName: string): string => {
        const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";
        const bucketName = process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME || "devlabs";
        return `${minioUrl.replace(/\/$/, "")}/${bucketName}/${objectName}`;
    },
};

export default fileUploadQueries;
