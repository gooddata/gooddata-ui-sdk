// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProtectedDataError, TimeoutError } from "@gooddata/sdk-backend-spi";

import { useRawExportHandler } from "../useRawExportHandler.js";

const { addProgress, addSuccess, addError, removeMessage } = vi.hoisted(() => ({
    addProgress: vi.fn().mockReturnValue({ id: "progress-message-id" }),
    addSuccess: vi.fn(),
    addError: vi.fn(),
    removeMessage: vi.fn(),
}));

vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => {
    const actual = (await importOriginal()) as Record<string, unknown>;
    return { ...actual, useToastMessage: () => ({ addProgress, addSuccess, addError, removeMessage }) };
});

const title = "my-export";

beforeEach(() => {
    vi.clearAllMocks();
    addProgress.mockReturnValue({ id: "progress-message-id" });
});

describe("useRawExportHandler", () => {
    it("shows the generic export error message for an unrecognized error", async () => {
        const { result } = renderHook(() => useRawExportHandler());
        const exportFunction = vi.fn().mockRejectedValue(new Error("boom"));

        await act(async () => {
            await result.current(exportFunction, title);
        });

        expect(addError).toHaveBeenCalledWith(expect.objectContaining({ id: "messages.exportResultError" }));
    });

    it("shows the restricted-data message for a ProtectedDataError", async () => {
        const { result } = renderHook(() => useRawExportHandler());
        const exportFunction = vi.fn().mockRejectedValue(new ProtectedDataError("protected"));

        await act(async () => {
            await result.current(exportFunction, title);
        });

        expect(addError).toHaveBeenCalledWith(
            expect.objectContaining({ id: "messages.exportResultRestrictedError" }),
        );
    });

    it("shows the timeout message for a TimeoutError", async () => {
        const { result } = renderHook(() => useRawExportHandler());
        const exportFunction = vi.fn().mockRejectedValue(new TimeoutError("export timed out"));

        await act(async () => {
            await result.current(exportFunction, title);
        });

        expect(addError).toHaveBeenCalledWith(
            expect.objectContaining({ id: "messages.exportResultError.timeout" }),
        );
    });
});
