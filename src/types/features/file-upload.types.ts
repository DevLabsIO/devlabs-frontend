export interface FileUploadResponse {
    objectName: string;
    url: string;
    directoryPath: string;
}

export interface FileListItem {
    objectName: string;
    fileName: string;
    fileSize: number;
    lastModified: string;
    downloadUrl: string;
}

export interface FileListResponse {
    files: FileListItem[];
}

export interface FileUploadParams {
    file: File;
    customName?: string;
    teamId?: string;
    teamName?: string;
    projectId?: string;
    projectName?: string;
    reviewId?: string;
    reviewName?: string;
}

export interface FileListParams {
    projectId?: string;
    projectName?: string;
    reviewId?: string;
    reviewName?: string;
    teamId?: string;
    teamName?: string;
}
