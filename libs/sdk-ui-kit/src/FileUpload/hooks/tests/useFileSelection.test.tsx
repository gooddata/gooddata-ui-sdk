// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FileValidationErrorCode } from "../../types.js";
import { useFileSelection } from "../useFileSelection.js";

describe("useFileSelection", () => {
    it("should accept files that pass validation", () => {
        const onFilesAccepted = vi.fn();
        const file = new File(["a,b"], "table.csv", { type: "text/csv" });

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                onFilesAccepted,
            }),
        );

        act(() => {
            result.current.selectFiles([file]);
        });

        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.rejections).toHaveLength(0);
        expect(onFilesAccepted).toHaveBeenCalledWith([file]);
    });

    it("should reject invalid file extensions", () => {
        const onFilesRejected = vi.fn();
        const file = new File(["body"], "notes.txt", { type: "text/plain" });

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                onFilesRejected,
            }),
        );

        act(() => {
            result.current.selectFiles([file]);
        });

        expect(result.current.selectedFiles).toHaveLength(0);
        expect(result.current.rejections).toHaveLength(1);
        expect(result.current.rejections[0].validation.errorCode).toBe(
            FileValidationErrorCode.InvalidFileType,
        );
        expect(onFilesRejected).toHaveBeenCalledTimes(1);
    });

    it("should accept file with unknown MIME type when only MIME is configured", () => {
        const onFilesAccepted = vi.fn();
        const file = new File(["a,b"], "table.csv");

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: "text/csv" },
                onFilesAccepted,
            }),
        );

        act(() => {
            result.current.selectFiles([file]);
        });

        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.rejections).toHaveLength(0);
        expect(onFilesAccepted).toHaveBeenCalledWith([file]);
    });

    it("should accept unknown MIME type when MIME rules are configured alongside extensions", () => {
        const onFilesAccepted = vi.fn();
        const file = new File(["binary"], "movie.avi");

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".txt,video/*" },
                onFilesAccepted,
            }),
        );

        act(() => {
            result.current.selectFiles([file]);
        });

        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.rejections).toHaveLength(0);
        expect(onFilesAccepted).toHaveBeenCalledWith([file]);
    });

    it("should reject unknown MIME type when only extension rules are configured and extension does not match", () => {
        const onFilesRejected = vi.fn();
        const file = new File(["a,b"], "table.txt");

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                onFilesRejected,
            }),
        );

        act(() => {
            result.current.selectFiles([file]);
        });

        expect(result.current.selectedFiles).toHaveLength(0);
        expect(result.current.rejections).toHaveLength(1);
        expect(result.current.rejections[0].validation.errorCode).toBe(
            FileValidationErrorCode.InvalidFileType,
        );
        expect(onFilesRejected).toHaveBeenCalledTimes(1);
    });

    it("should accumulate files across calls when multiple is true", () => {
        const firstFile = new File(["a"], "first.csv", { type: "text/csv" });
        const secondFile = new File(["b"], "second.csv", { type: "text/csv" });

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                multiple: true,
            }),
        );

        act(() => {
            result.current.selectFiles([firstFile]);
            result.current.selectFiles([secondFile]);
        });

        expect(result.current.selectedFiles).toHaveLength(2);
        expect(result.current.selectedFiles[0].name).toBe("first.csv");
        expect(result.current.selectedFiles[1].name).toBe("second.csv");
    });

    it("should keep only the latest file when multiple is false", () => {
        const firstFile = new File(["a"], "first.csv", { type: "text/csv" });
        const secondFile = new File(["b"], "second.csv", { type: "text/csv" });

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                multiple: false,
            }),
        );

        act(() => {
            result.current.selectFiles([firstFile]);
            result.current.selectFiles([secondFile]);
        });

        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.selectedFiles[0].name).toBe("second.csv");
    });

    it("should remove a specific file from selectedFiles", () => {
        const file1 = new File(["a"], "first.csv", { type: "text/csv" });
        const file2 = new File(["b"], "second.csv", { type: "text/csv" });

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                multiple: true,
            }),
        );

        act(() => {
            result.current.selectFiles([file1, file2]);
        });

        act(() => {
            result.current.removeFile(file1);
        });

        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.selectedFiles[0].name).toBe("second.csv");
    });

    it("should clear all files and rejections", () => {
        const validFile = new File(["a"], "table.csv", { type: "text/csv" });
        const invalidFile = new File(["b"], "notes.txt", { type: "text/plain" });

        const { result } = renderHook(() =>
            useFileSelection({
                rules: { allowedFileTypes: ".csv" },
                multiple: true,
            }),
        );

        act(() => {
            result.current.selectFiles([validFile, invalidFile]);
        });

        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.rejections).toHaveLength(1);

        act(() => {
            result.current.clearSelection();
        });

        expect(result.current.selectedFiles).toHaveLength(0);
        expect(result.current.rejections).toHaveLength(0);
    });

    it("should use custom onValidateFile when provided", () => {
        const onFilesAccepted = vi.fn();
        const onFilesRejected = vi.fn();
        const file = new File(["a"], "table.csv", { type: "text/csv" });
        const onValidateFile = vi.fn().mockReturnValue({
            isValid: false,
            errorCode: FileValidationErrorCode.InvalidFileType,
        });

        const { result } = renderHook(() =>
            useFileSelection({ onValidateFile, onFilesAccepted, onFilesRejected }),
        );

        act(() => {
            result.current.selectFiles([file]);
        });

        expect(onValidateFile).toHaveBeenCalledWith(file);
        expect(result.current.selectedFiles).toHaveLength(0);
        expect(result.current.rejections).toHaveLength(1);
        expect(onFilesRejected).toHaveBeenCalledTimes(1);
        expect(onFilesAccepted).not.toHaveBeenCalled();
    });
});
