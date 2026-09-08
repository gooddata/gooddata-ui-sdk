// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";

import { IntlWrapper } from "../../../localization/IntlWrapper.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const createScheduledEmailMock =
    vi.fn<(a: IAutomationMetadataObjectDefinition) => Promise<IAutomationMetadataObject>>();
const saveScheduledEmailMock = vi.fn<(a: IAutomationMetadataObject) => Promise<IAutomationMetadataObject>>();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated — against their real dependencies — by a test file that ran earlier in the same
// worker, which turns those `vi.mock()` calls into no-ops. Dropping the module registry from
// `vi.hoisted()` (it runs before this file's own imports, unlike any `beforeEach`) makes those
// imports resolve through the mocks.
vi.hoisted(() => {
    vi.resetModules();
});

// What the mocked draft context returns; each test sets it through renderSaveHook.
const draftState = vi.hoisted(() => ({
    editedAutomation: undefined as unknown as IAutomationMetadataObject | IAutomationMetadataObjectDefinition,
}));

vi.mock("../../contexts/ScheduledEmailDialogContext.js", () => ({
    useScheduledEmailDialogContext: () => ({
        createScheduledEmail: createScheduledEmailMock,
        saveScheduledEmail: saveScheduledEmailMock,
        deleteScheduledEmail: vi.fn(),
        widgetLocalIdToTabIdMap: {},
    }),
}));

vi.mock("./ScheduledExportDraftContext.js", () => ({
    useScheduledExportDraft: () => ({ editedAutomation: draftState.editedAutomation }),
}));

import { type IUseSaveScheduledEmailCallbacks } from "./types.js";
import { useSaveScheduledEmailToBackend } from "./useSaveScheduledEmailToBackend.js";

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
    callbacks: IUseSaveScheduledEmailCallbacks = {},
) {
    draftState.editedAutomation = automation;
    return renderHook(() => useSaveScheduledEmailToBackend(callbacks), {
        wrapper: IntlWrapper,
    });
}

// ---------------------------------------------------------------------------
// Tests — Create path
// ---------------------------------------------------------------------------

describe("useSaveScheduledEmailToBackend — create path", () => {
    it("calls onCreateSuccess with the created automation on resolution", async () => {
        const onCreateSuccess = vi.fn();

        let resolveCreate!: (value: IAutomationMetadataObject) => void;
        createScheduledEmailMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveCreate = resolve;
            }),
        );

        const { result } = renderSaveHook(newAutomation, { onCreateSuccess });

        act(() => {
            result.current.handleSaveScheduledEmail();
        });

        expect(onCreateSuccess).not.toHaveBeenCalled();

        await act(async () => {
            resolveCreate(createdAutomation);
        });

        expect(onCreateSuccess).toHaveBeenCalledWith(createdAutomation);
    });

    it("on 400 error: sets savingErrorMessage and does NOT call onCreateError", async () => {
        const onCreateError = vi.fn();

        const error400 = Object.assign(new Error("Bad Request"), {
            cause: { response: { status: 400, data: { detail: "Invalid cron expression" } } },
        });
        createScheduledEmailMock.mockRejectedValue(error400);

        const { result } = renderSaveHook(newAutomation, { onCreateError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(result.current.savingErrorMessage).toBe("Invalid cron expression");
        expect(onCreateError).not.toHaveBeenCalled();
    });

    it("on non-400 error: calls onCreateError and does NOT set savingErrorMessage", async () => {
        const onCreateError = vi.fn();

        const error500 = Object.assign(new Error("Internal Server Error"), {
            cause: { response: { status: 500 } },
        });
        createScheduledEmailMock.mockRejectedValue(error500);

        const { result } = renderSaveHook(newAutomation, { onCreateError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(onCreateError).toHaveBeenCalledWith(error500);
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
    it("calls onUpdateSuccess with the backend's returned automation, not the pre-request draft", async () => {
        const onUpdateSuccess = vi.fn();

        // Distinct title so the assertion fails if the hook fires the draft instead.
        const savedAutomationFromBackend: IAutomationMetadataObject = {
            ...existingAutomation,
            title: "Backend-assigned title",
        };

        let resolveUpdate!: (value: IAutomationMetadataObject) => void;
        saveScheduledEmailMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveUpdate = resolve;
            }),
        );

        const { result } = renderSaveHook(existingAutomation, { onUpdateSuccess });

        act(() => {
            result.current.handleSaveScheduledEmail();
        });

        expect(onUpdateSuccess).not.toHaveBeenCalled();

        await act(async () => {
            resolveUpdate(savedAutomationFromBackend);
        });

        expect(onUpdateSuccess).toHaveBeenCalledTimes(1);
        expect(onUpdateSuccess).toHaveBeenCalledWith(savedAutomationFromBackend);
    });

    it("on 400 error: sets savingErrorMessage and does NOT call onUpdateError", async () => {
        const onUpdateError = vi.fn();

        const error400 = Object.assign(new Error("Bad Request"), {
            cause: { response: { status: 400, data: { detail: "Title too long" } } },
        });
        saveScheduledEmailMock.mockRejectedValue(error400);

        const { result } = renderSaveHook(existingAutomation, { onUpdateError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(result.current.savingErrorMessage).toBe("Title too long");
        expect(onUpdateError).not.toHaveBeenCalled();
    });

    it("on non-400 error: calls onUpdateError and does NOT set savingErrorMessage", async () => {
        const onUpdateError = vi.fn();

        const error503 = Object.assign(new Error("Service Unavailable"), {
            cause: { response: { status: 503 } },
        });
        saveScheduledEmailMock.mockRejectedValue(error503);

        const { result } = renderSaveHook(existingAutomation, { onUpdateError });

        await act(async () => {
            result.current.handleSaveScheduledEmail();
        });

        expect(onUpdateError).toHaveBeenCalledWith(error503);
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
