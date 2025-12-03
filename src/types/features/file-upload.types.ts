export interface FileUploadResponse {
    objectName: string;
    fileName: string;
    url: string;
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
    count: number;
}
