// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useRef, useState } from "react";

import { type IUploadFileItem, UploadItemStatus } from "../types.js";

/**
 * @internal
 */
export interface IUseUploadQueueConfig {
    uploadFn: (
        file: File,
    ) => Promise<void | { status: typeof UploadItemStatus.Error; errorMessage?: string }>;
    onUploadSuccess?: (file: File) => void;
    onUploadError?: (file: File, error: unknown) => void;
}

/**
 * @internal
 */
export interface IUseUploadQueueResult {
    queue: IUploadFileItem[];
    getItemById: (id: string) => IUploadFileItem | undefined;
    requireItemById: (id: string) => IUploadFileItem;
    isUploading: boolean;
    addToQueue: (files: File[]) => void;
    removeFromQueue: (fileId: string) => void;
    updateFileStatus: (fileId: string, status: IUploadFileItem["status"], errorMessage?: string) => void;
    uploadFile: (fileId: string) => Promise<IUploadFileItem>;
    uploadAll: () => Promise<IUploadFileItem[]>;
    clearQueue: () => void;
}

const createFileId = (file: File): string => `${file.name}-${file.lastModified}-${file.size}`;

/**
 * @internal
 */
export function useUploadQueue({
    uploadFn,
    onUploadSuccess,
    onUploadError,
}: IUseUploadQueueConfig): IUseUploadQueueResult {
    const [queue, setQueueState] = useState<IUploadFileItem[]>([]);

    // We keep a ref that mirrors the queue state so that functions like uploadAll()
    // can be called immediately after addToQueue() without waiting for a re-render.
    // The ref is updated synchronously (before setQueueState) so it is always current.
    const queueRef = useRef(queue);
    const setQueue = useCallback((updaterFn: (oldQueue: typeof queue) => typeof queue) => {
        const newQueue = updaterFn(queueRef.current);

        queueRef.current = newQueue;
        setQueueState(newQueue);
    }, []);

    const getItemById = useCallback((id: string) => {
        return queueRef.current.find((item) => item.id === id);
    }, []);

    const requireItemById = useCallback(
        (id: string) => {
            const item = getItemById(id);
            if (!item) {
                throw new Error(`File with ID ${id} not found in upload queue`);
            }
            return item;
        },
        [getItemById],
    );

    const addToQueue = useCallback(
        (files: File[]) => {
            const newItems: IUploadFileItem[] = files.map((file) => ({
                id: createFileId(file),
                file,
                status: UploadItemStatus.Idle,
            }));

            setQueue((prev) => {
                const combinedQueue = [...newItems, ...prev];
                const deduplicatedIds = Array.from(new Set(combinedQueue.map((item) => item.id)));

                return deduplicatedIds.map((id) => combinedQueue.find((item) => item.id === id)!);
            });
        },
        [setQueue],
    );

    const removeFromQueue = useCallback(
        (fileId: string) => {
            setQueue((prev) => prev.filter((item) => item.id !== fileId));
        },
        [setQueue],
    );

    const updateFileStatus = useCallback(
        (fileId: string, status: IUploadFileItem["status"], errorMessage?: string) => {
            setQueue((prev) =>
                prev.map((item) =>
                    item.id === fileId
                        ? {
                              ...item,
                              status,
                              errorMessage,
                          }
                        : item,
                ),
            );
        },
        [setQueue],
    );

    const uploadFile = useCallback(
        async (fileId: string) => {
            const item = requireItemById(fileId);

            updateFileStatus(item.id, UploadItemStatus.Uploading);
            try {
                const result = await uploadFn(item.file);
                updateFileStatus(item.id, result?.status ?? UploadItemStatus.Success, result?.errorMessage);

                if (result?.status === UploadItemStatus.Error) {
                    onUploadError?.(item.file, new Error(result.errorMessage));
                } else {
                    onUploadSuccess?.(item.file);
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : undefined;
                updateFileStatus(item.id, UploadItemStatus.Error, errorMessage);
                onUploadError?.(item.file, error);
            }

            return requireItemById(item.id);
        },
        [onUploadError, onUploadSuccess, requireItemById, updateFileStatus, uploadFn],
    );

    const uploadAll = useCallback(async () => {
        const retryableItems = queueRef.current.filter(
            (item) => item.status === UploadItemStatus.Idle || item.status === UploadItemStatus.Error,
        );

        const processedItems: typeof retryableItems = [];

        if (retryableItems.length === 0) {
            return processedItems;
        }

        for (const item of retryableItems) {
            processedItems.push(await uploadFile(item.id));
        }

        return processedItems;
    }, [uploadFile]);

    const clearQueue = useCallback(() => {
        setQueue(() => []);
    }, [setQueue]);

    const isUploading = useMemo(() => {
        return queue.some((item) => item.status === UploadItemStatus.Uploading);
    }, [queue]);

    return {
        queue,
        requireItemById,
        getItemById,
        isUploading,
        addToQueue,
        removeFromQueue,
        updateFileStatus,
        uploadAll,
        uploadFile,
        clearQueue,
    };
}
