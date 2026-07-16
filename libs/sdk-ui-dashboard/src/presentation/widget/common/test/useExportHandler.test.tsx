// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DataTooLargeError, ProtectedDataError, TimeoutError } from "@gooddata/sdk-backend-spi";
import { type IExtendedExportConfig } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";
import { useExportHandler } from "../useExportHandler.js";

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

const exportConfig = { format: "csv" } as unknown as IExtendedExportConfig;

function renderExportHandler() {
    return renderHook(() => useExportHandler(), { wrapper: IntlWrapper });
}

beforeEach(() => {
    vi.clearAllMocks();
    addProgress.mockReturnValue({ id: "progress-message-id" });
});

describe("useExportHandler", () => {
    it("shows the generic export error message for an unrecognized error", async () => {
        const { result } = renderExportHandler();
        const exportFunction = vi.fn().mockRejectedValue(new Error("boom"));

        await act(async () => {
            await result.current(exportFunction, exportConfig);
        });

        expect(addError).toHaveBeenCalledWith(expect.objectContaining({ id: "messages.exportResultError" }));
    });

    it("shows the restricted-data message for a ProtectedDataError", async () => {
        const { result } = renderExportHandler();
        const exportFunction = vi.fn().mockRejectedValue(new ProtectedDataError("protected"));

        await act(async () => {
            await result.current(exportFunction, exportConfig);
        });

        expect(addError).toHaveBeenCalledWith(
            expect.objectContaining({ id: "messages.exportResultRestrictedError" }),
        );
    });

    it("shows the too-many-rows message for a DataTooLargeError with an export-rows limit break", async () => {
        const { result } = renderExportHandler();
        const error = new DataTooLargeError("too large", undefined, {
            structuredDetail: {
                limitBreaks: [{ limitType: "export-rows", limit: 1000, actualValue: 1500 }],
            },
        });
        const exportFunction = vi.fn().mockRejectedValue(error);

        await act(async () => {
            await result.current(exportFunction, exportConfig);
        });

        expect(addError).toHaveBeenCalledWith(
            expect.objectContaining({ id: "messages.exportResultError.tooManyRows" }),
            expect.objectContaining({ values: { actual: "1,500", limit: "1,000" } }),
        );
    });

    it("shows the timeout message for a TimeoutError", async () => {
        const { result } = renderExportHandler();
        const exportFunction = vi.fn().mockRejectedValue(new TimeoutError("export timed out"));

        await act(async () => {
            await result.current(exportFunction, exportConfig);
        });

        expect(addError).toHaveBeenCalledWith(
            expect.objectContaining({ id: "messages.exportResultError.timeout" }),
        );
    });
});
