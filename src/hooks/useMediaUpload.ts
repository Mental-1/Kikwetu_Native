import { useCallback, useState } from "react";
import { mediaService } from "../services/media.service";

export interface UploadState {
    progress: number;
    isUploading: boolean;
    error: string | null;
    mediaId: string | null;
    status: "idle" | "uploading" | "completed" | "failed";
}

export interface MediaFile {
    uri: string;
    type?: "image" | "video";
    fileName?: string | null;
    mimeType?: string;
    fileSize?: number;
}

export function useMediaUpload() {
    const [uploadState, setUploadState] = useState<UploadState>({
        progress: 0,
        isUploading: false,
        error: null,
        mediaId: null,
        status: "idle",
    });

    const uploadMedia = useCallback(
        async (file: MediaFile, onProgress?: (progress: number) => void) => {
            setUploadState({
                progress: 0,
                isUploading: true,
                error: null,
                mediaId: null,
                status: "uploading",
            });

            try {
                // 1. Prepare file data
                const response = await fetch(file.uri);
                const blob = await response.blob();

                const fileType = file.type === "video" ? "video" : "image";
                const fileName = file.fileName ||
                    `upload-${Date.now()}.${
                        fileType === "image" ? "jpg" : "mp4"
                    }`;
                const mimeType = file.mimeType || blob.type ||
                    (fileType === "image" ? "image/jpeg" : "video/mp4");
                const fileSize = blob.size;

                // 2. Initiate Upload
                const initResponse = await mediaService.initiateUpload(
                    fileType,
                    fileName,
                    fileSize,
                    mimeType,
                );

                if (initResponse.error || !initResponse.data) {
                    throw new Error(
                        initResponse.error || "Failed to initiate upload",
                    );
                }

                const initData = initResponse.data;

                // 3. Perform Upload (TUS)
                await mediaService.uploadFile(
                    blob,
                    initData,
                    (bytesUploaded, bytesTotal) => {
                        const progress = (bytesUploaded / bytesTotal) * 100;
                        setUploadState((prev) => ({ ...prev, progress }));
                        if (onProgress) onProgress(progress);
                    },
                );

                // 4. Complete Upload
                const completeResponse = await mediaService.completeUpload({
                    mediaId: initData.mediaId,
                    status: "completed",
                });

                if (completeResponse.error) {
                    throw new Error(
                        completeResponse.error || "Failed to complete upload",
                    );
                }

                setUploadState({
                    progress: 100,
                    isUploading: false,
                    error: null,
                    mediaId: initData.mediaId,
                    status: "completed",
                });

                return initData.mediaId;
            } catch (error) {
                console.error("Upload error:", error);
                setUploadState((prev) => ({
                    ...prev,
                    isUploading: false,
                    status: "failed",
                    error: error instanceof Error
                        ? error.message
                        : "Upload failed",
                }));
                throw error;
            }
        },
        [],
    );

    const resetUpload = useCallback(() => {
        setUploadState({
            progress: 0,
            isUploading: false,
            error: null,
            mediaId: null,
            status: "idle",
        });
    }, []);

    return {
        ...uploadState,
        uploadMedia,
        resetUpload,
    };
}
