import { Upload } from "tus-js-client";
import { apiClient, ApiResponse } from "./apiClient";

export interface InitiateUploadResponse {
    mediaId: string;
    provider: "supabase" | "bunnycdn";
    uploadUrl: string;
    // Supabase specific
    token?: string;
    objectName?: string;
    bucketName?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    // BunnyCDN specific
    videoId?: string;
    authorizationSignature?: string;
    authorizationExpire?: number;
    libraryId?: string;
}

export interface CompleteUploadRequest {
    mediaId: string;
    status: "completed" | "failed";
}

class MediaService {
    private readonly baseEndpoint = "/media";

    /**
     * Initiate an upload session
     */
    async initiateUpload(
        fileType: "image" | "video",
        fileName: string,
        fileSize: number,
        mimeType: string,
    ): Promise<ApiResponse<InitiateUploadResponse>> {
        return await apiClient.post<InitiateUploadResponse>(
            `${this.baseEndpoint}/upload/initiate`,
            {
                fileType,
                fileName,
                fileSize,
                mimeType,
            },
        );
    }

    /**
     * Complete an upload session
     */
    async completeUpload(
        data: CompleteUploadRequest,
    ): Promise<ApiResponse<{ mediaId: string }>> {
        return await apiClient.post<{ mediaId: string }>(
            `${this.baseEndpoint}/upload/complete`,
            data,
        );
    }

    /**
     * Upload file using TUS protocol 
     */
    async uploadFile(
        file: any, // Blob or File object
        initData: InitiateUploadResponse,
        onProgress?: (bytesUploaded: number, bytesTotal: number) => void,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const { provider, uploadUrl } = initData;

            let headers: Record<string, string> = {};
            let uploadUrlToUse = uploadUrl;
            let metadata: Record<string, string> = {
                filename: file.name || "upload",
                filetype: file.type,
            };

            if (provider === "bunnycdn") {
                headers = {
                    AuthorizationSignature: initData.authorizationSignature ||
                        "",
                    AuthorizationExpire: (initData.authorizationExpire || 0)
                        .toString(),
                    VideoId: initData.videoId || "",
                    LibraryId: (initData.libraryId || "").toString(),
                };
                metadata = {
                    ...metadata,
                    filetype: file.type,
                    title: file.name,
                };
            } else if (provider === "supabase") {
                headers = {
                    Authorization: `Bearer ${initData.token}`,
                    "x-upsert": "true",
                };

                // Supabase TUS requires the bucket and object name in the URL or metadata
                // The provided URL is the base resumable endpoint
                // We need to append the bucket and object name
                uploadUrlToUse =
                    `${uploadUrl}/${initData.bucketName}/${initData.objectName}`;
            }

            const upload = new Upload(file, {
                endpoint: uploadUrlToUse,
                retryDelays: [0, 3000, 5000, 10000, 20000],
                headers,
                metadata,
                onError: (error) => {
                    reject(error);
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    if (onProgress) {
                        onProgress(bytesUploaded, bytesTotal);
                    }
                },
                onSuccess: () => {
                    resolve();
                },
            });

            upload.start();
        });
    }
}

export const mediaService = new MediaService();
