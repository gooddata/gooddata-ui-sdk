// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const createScheduledEmailMock =
    vi.fn<(a: IAutomationMetadataObjectDefinition) => Promise<IAutomationMetadataObject>>();
const saveScheduledEmailMock = vi.fn<(a: IAutomationMetadataObject) => Promise<IAutomationMetadataObject>>();

vi.mock("../../../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: () => ({
        createScheduledEmail: createScheduledEmailMock,
        saveScheduledEmail: saveScheduledEmailMock,
        deleteScheduledEmail: vi.fn(),
        widgetLocalIdToTabIdMap: {},
    }),
}));

import { useSaveScheduledEmailToBackend } from "../useSaveScheduledEmailToBackend.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** An automation without an id — triggers the create path. */
const newAutomation: IAutomationMetadataObjectDefinition = {
    type: "automation",
    title: "Test schedule",
} as unknown as IAutomationMetadataObjectDefinition;

/** An automation with an id — triggers the update path. */
const existingAutomation: IAutomationMetadataObject = {
    type: "automation",
    id: "auto-1",
    title: "Existing schedule",
    ref: { identifier: "auto-1" },
    uri: "/auto-1",
    identifier: "auto-1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
} as unknown as IAutomationMetadataObject;

const createdAutomation: IAutomationMetadataObject = {
    ...existingAutomation,
    id: "created-1",
} as IAutomationMetadataObject;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderSaveHook(
    automation: IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
    callbacks: Parameters<typeof useSaveScheduledEmailToBackend>[1] = {},
) {
    return renderHook(() => useSaveScheduledEmailToBackend(automation, callbacks), {
        wrapper: IntlWrapper,
    });
}

// ---------------------------------------------------------------------------
// Tests — Create path
// ---------------------------------------------------------------------------

describe("useSaveScheduledEmailToBackend — create path", () => {
    it("calls onSubmit before createScheduledEmail resolves, and onSuccess on resolution", async () => {
        const onSubmit = vi.fn();
        const onSuccess = vi.fn();

        let resolveCreate!: (value: IAutomationMetadataObject) => void;
        createScheduledEmailMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveCreate = resolve;
            }),
        );

        const { result } = renderSaveHook(newAutomation, { onSubmit, onSuccess });

        act(() => {
            result.current.handleSaveScheduledEmail();
        });

        // onSubmit must have fired synchronously before the promise resolves
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSuccess).not.toHaveBeenCalled();

        await act(async () => {
            resolveCreate(createdAutomation);
        });

        expect(onSuccess).toHaveBeenCalledWith(createdAutomation);
    });

    it("on 400 error: sets savingErrorMessage and does NOT call onError", async () => {
        const onError = vi.fn();

        const error400 = Object.assign(new Error("Bad Request"), {
            cause: { response: { status: 400, data: { detail: "Invalid cron expression" } } },
        });
        createScheduledEmailMock.mockRejectedValue(error400);

        const { result } = renderSaveHook(newAutomation, { onError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(result.current.savingErrorMessage).toBe("Invalid cron expression");
        expect(onError).not.toHaveBeenCalled();
    });

    it("on non-400 error: calls onError and does NOT set savingErrorMessage", async () => {
        const onError = vi.fn();

        const error500 = Object.assign(new Error("Internal Server Error"), {
            cause: { response: { status: 500 } },
        });
        createScheduledEmailMock.mockRejectedValue(error500);

        const { result } = renderSaveHook(newAutomation, { onError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(onError).toHaveBeenCalledWith(error500);
        expect(result.current.savingErrorMessage).toBeUndefined();
    });

    it("isSavingScheduledEmail is true while in-flight, false after settle", async () => {
        let resolveCreate!: (value: IAutomationMetadataObject) => void;
        createScheduledEmailMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveCreate = resolve;
            }),
        );

        const { result } = renderSaveHook(newAutomation, {});

        act(() => {
            result.current.handleSaveScheduledEmail();
        });

        expect(result.current.isSavingScheduledEmail).toBe(true);

        await act(async () => {
            resolveCreate(createdAutomation);
        });

        expect(result.current.isSavingScheduledEmail).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Tests — Update path
// ---------------------------------------------------------------------------

describe("useSaveScheduledEmailToBackend — update path", () => {
    it("calls onSave before saveScheduledEmail resolves, and onSaveSuccess on resolution", async () => {
        const onSave = vi.fn();
        const onSaveSuccess = vi.fn();

        let resolveUpdate!: (value: IAutomationMetadataObject) => void;
        saveScheduledEmailMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveUpdate = resolve;
            }),
        );

        const { result } = renderSaveHook(existingAutomation, { onSave, onSaveSuccess });

        act(() => {
            result.current.handleSaveScheduledEmail();
        });

        // onSave fires synchronously before the promise resolves
        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSaveSuccess).not.toHaveBeenCalled();

        await act(async () => {
            resolveUpdate(existingAutomation);
        });

        expect(onSaveSuccess).toHaveBeenCalledTimes(1);
    });

    it("on 400 error: sets savingErrorMessage and does NOT call onSaveError", async () => {
        const onSaveError = vi.fn();

        const error400 = Object.assign(new Error("Bad Request"), {
            cause: { response: { status: 400, data: { detail: "Title too long" } } },
        });
        saveScheduledEmailMock.mockRejectedValue(error400);

        const { result } = renderSaveHook(existingAutomation, { onSaveError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(result.current.savingErrorMessage).toBe("Title too long");
        expect(onSaveError).not.toHaveBeenCalled();
    });

    it("on non-400 error: calls onSaveError and does NOT set savingErrorMessage", async () => {
        const onSaveError = vi.fn();

        const error503 = Object.assign(new Error("Service Unavailable"), {
            cause: { response: { status: 503 } },
        });
        saveScheduledEmailMock.mockRejectedValue(error503);

        const { result } = renderSaveHook(existingAutomation, { onSaveError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(onSaveError).toHaveBeenCalledWith(error503);
        expect(result.current.savingErrorMessage).toBeUndefined();
    });

    it("isSavingScheduledEmail is true while in-flight, false after settle", async () => {
        let resolveUpdate!: (value: IAutomationMetadataObject) => void;
        saveScheduledEmailMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveUpdate = resolve;
            }),
        );

        const { result } = renderSaveHook(existingAutomation, {});

        act(() => {
            result.current.handleSaveScheduledEmail();
        });

        expect(result.current.isSavingScheduledEmail).toBe(true);

        await act(async () => {
            resolveUpdate(existingAutomation);
        });

        expect(result.current.isSavingScheduledEmail).toBe(false);
    });
});
