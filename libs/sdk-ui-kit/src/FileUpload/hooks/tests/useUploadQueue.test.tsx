// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UploadItemStatus } from "../../types.js";
import { useUploadQueue } from "../useUploadQueue.js";

describe("useUploadQueue", () => {
    it("should upload files and set success status", async () => {
        const file = new File(["a"], "data.csv", { type: "text/csv" });
        const uploadFn = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([file]);
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        expect(uploadFn).toHaveBeenCalledWith(file);
        expect(result.current.queue[0].status).toBe(UploadItemStatus.Success);
    });

    it("should store error status when upload fails", async () => {
        const file = new File(["a"], "data.csv", { type: "text/csv" });
        const uploadFn = vi.fn().mockRejectedValue(new Error("Failed"));

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([file]);
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        expect(result.current.queue[0].status).toBe(UploadItemStatus.Error);
        expect(result.current.queue[0].errorMessage).toBe("Failed");
    });

    it("should not re-upload successful files when uploadAll is called repeatedly", async () => {
        const file = new File(["a"], "data.csv", { type: "text/csv" });
        const uploadFn = vi.fn().mockResolvedValue(undefined);

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([file]);
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        expect(uploadFn).toHaveBeenCalledTimes(1);
        expect(result.current.queue[0].status).toBe(UploadItemStatus.Success);
    });

    it("should retry only failed files on subsequent uploadAll calls", async () => {
        const successfulFile = new File(["a"], "success.csv", { type: "text/csv" });
        const flakyFile = new File(["b"], "flaky.csv", { type: "text/csv" });
        const uploadFn = vi
            .fn()
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error("Temporary failure"))
            .mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([successfulFile, flakyFile]);
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        expect(uploadFn).toHaveBeenCalledTimes(3);
        expect(uploadFn).toHaveBeenNthCalledWith(1, successfulFile);
        expect(uploadFn).toHaveBeenNthCalledWith(2, flakyFile);
        expect(uploadFn).toHaveBeenNthCalledWith(3, flakyFile);
        expect(result.current.queue[0].status).toBe(UploadItemStatus.Success);
        expect(result.current.queue[1].status).toBe(UploadItemStatus.Success);
    });

    it("should remove a file from the queue", () => {
        const file = new File(["a"], "data.csv", { type: "text/csv" });
        const uploadFn = vi.fn();

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([file]);
        });

        const fileId = result.current.queue[0].id;

        act(() => {
            result.current.removeFromQueue(fileId);
        });

        expect(result.current.queue).toHaveLength(0);
    });

    it("should clear the entire queue", () => {
        const file1 = new File(["a"], "a.csv", { type: "text/csv" });
        const file2 = new File(["b"], "b.csv", { type: "text/csv" });
        const uploadFn = vi.fn();

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([file1, file2]);
        });

        act(() => {
            result.current.clearQueue();
        });

        expect(result.current.queue).toHaveLength(0);
    });

    it("should compute isUploading as true when any file has Uploading status", () => {
        const uploadFn = vi.fn();
        const file = new File(["a"], "data.csv", { type: "text/csv" });

        const { result } = renderHook(() => useUploadQueue({ uploadFn }));

        act(() => {
            result.current.addToQueue([file]);
        });

        expect(result.current.isUploading).toBe(false);

        act(() => {
            result.current.updateFileStatus(result.current.queue[0].id, UploadItemStatus.Uploading);
        });

        expect(result.current.isUploading).toBe(true);
    });

    it("should invoke onUploadSuccess callback after a successful upload", async () => {
        const file = new File(["a"], "data.csv", { type: "text/csv" });
        const uploadFn = vi.fn().mockResolvedValue(undefined);
        const onUploadSuccess = vi.fn();

        const { result } = renderHook(() => useUploadQueue({ uploadFn, onUploadSuccess }));

        act(() => {
            result.current.addToQueue([file]);
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        expect(onUploadSuccess).toHaveBeenCalledWith(file);
    });

    it("should invoke onUploadError callback after a failed upload", async () => {
        const file = new File(["a"], "data.csv", { type: "text/csv" });
        const error = new Error("Network error");
        const uploadFn = vi.fn().mockRejectedValue(error);
        const onUploadError = vi.fn();

        const { result } = renderHook(() => useUploadQueue({ uploadFn, onUploadError }));

        act(() => {
            result.current.addToQueue([file]);
        });

        await act(async () => {
            await result.current.uploadAll();
        });

        expect(onUploadError).toHaveBeenCalledWith(file, error);
    });
});
