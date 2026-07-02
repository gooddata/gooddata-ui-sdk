// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
} from "@gooddata/sdk-model";
import { convertError } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../../../../../localization/IntlWrapper.js";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const createAlertMock =
    vi.fn<(a: IAutomationMetadataObjectDefinition) => Promise<IAutomationMetadataObject>>();
const saveAlertMock = vi.fn<(a: IAutomationMetadataObject) => Promise<IAutomationMetadataObject>>();

vi.mock("../../../../contexts/AlertingDialogContext.js", () => ({
    useAlertingDialogContext: () => ({
        createAlert: createAlertMock,
        saveAlert: saveAlertMock,
        deleteAlert: vi.fn(),
    }),
}));

vi.mock("../../utils/getters.js", async (importOriginal: () => Promise<Record<string, unknown>>) => {
    const original = await importOriginal();
    return {
        ...original,
        getDescription: vi.fn().mockReturnValue("Derived alert title"),
    };
});

import { useAlertSubmit, type IUseAlertSubmitProps } from "../useAlertSubmit.js";

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseAutomation: IAutomationMetadataObjectDefinition = {
    type: "automation",
    title: "My Alert",
} as unknown as IAutomationMetadataObjectDefinition;

const automationNoTitle: IAutomationMetadataObjectDefinition = {
    type: "automation",
    title: "",
} as unknown as IAutomationMetadataObjectDefinition;

const alertToEdit: IAutomationMetadataObject = {
    type: "automation",
    id: "alert-1",
    title: "Existing Alert",
    ref: { identifier: "alert-1" },
    uri: "/alert-1",
    identifier: "alert-1",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
} as unknown as IAutomationMetadataObject;

const savedAlert: IAutomationMetadataObject = {
    ...alertToEdit,
    id: "alert-saved",
} as IAutomationMetadataObject;

const createdAlert: IAutomationMetadataObject = {
    ...alertToEdit,
    id: "alert-created",
} as IAutomationMetadataObject;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderAlertSubmitHook(props: Partial<IUseAlertSubmitProps> = {}) {
    const mergedProps: IUseAlertSubmitProps = {
        editedAutomation: baseAutomation,
        supportedMeasures: [],
        ...props,
    };
    return renderHook(() => useAlertSubmit(mergedProps), { wrapper: IntlWrapper });
}

// ---------------------------------------------------------------------------
// Tests — create path
// ---------------------------------------------------------------------------

describe("useAlertSubmit — create path", () => {
    it("calls createAlert then onSuccess with the result; saveAlert and onSaveSuccess are untouched", async () => {
        const onSuccess = vi.fn();
        const onSaveSuccess = vi.fn();

        let resolveCreate!: (value: IAutomationMetadataObject) => void;
        createAlertMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveCreate = resolve;
            }),
        );

        const { result } = renderAlertSubmitHook({ onSuccess, onSaveSuccess });

        act(() => {
            void result.current.submit();
        });

        expect(createAlertMock).toHaveBeenCalledTimes(1);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(saveAlertMock).not.toHaveBeenCalled();

        await act(async () => {
            resolveCreate(createdAlert);
        });

        expect(onSuccess).toHaveBeenCalledWith(createdAlert);
        expect(onSaveSuccess).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Tests — save path
// ---------------------------------------------------------------------------

describe("useAlertSubmit — save path", () => {
    it("calls saveAlert then onSaveSuccess with the result; createAlert and onSuccess are untouched", async () => {
        const onSaveSuccess = vi.fn();
        const onSuccess = vi.fn();

        let resolveUpdate!: (value: IAutomationMetadataObject) => void;
        saveAlertMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveUpdate = resolve;
            }),
        );

        const { result } = renderAlertSubmitHook({ alertToEdit, onSaveSuccess, onSuccess });

        act(() => {
            void result.current.submit();
        });

        expect(saveAlertMock).toHaveBeenCalledTimes(1);
        expect(onSaveSuccess).not.toHaveBeenCalled();
        expect(createAlertMock).not.toHaveBeenCalled();

        await act(async () => {
            resolveUpdate(savedAlert);
        });

        expect(onSaveSuccess).toHaveBeenCalledWith(savedAlert);
        expect(onSuccess).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Tests — error routing
// ---------------------------------------------------------------------------

describe("useAlertSubmit — error routing", () => {
    it("createAlert rejects → calls onError with convertError result; onSaveError untouched", async () => {
        const onError = vi.fn();
        const onSaveError = vi.fn();
        const rawError = new Error("Create failed");
        createAlertMock.mockRejectedValue(rawError);

        const { result } = renderAlertSubmitHook({ onError, onSaveError });

        await act(async () => {
            await result.current.submit();
        });

        expect(onError).toHaveBeenCalledWith(convertError(rawError));
        expect(onSaveError).not.toHaveBeenCalled();
    });

    it("saveAlert rejects → calls onSaveError with convertError result; onError untouched", async () => {
        const onError = vi.fn();
        const onSaveError = vi.fn();
        const rawError = new Error("Save failed");
        saveAlertMock.mockRejectedValue(rawError);

        const { result } = renderAlertSubmitHook({ alertToEdit, onError, onSaveError });

        await act(async () => {
            await result.current.submit();
        });

        expect(onSaveError).toHaveBeenCalledWith(convertError(rawError));
        expect(onError).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Tests — title fallback
// ---------------------------------------------------------------------------

describe("useAlertSubmit — title fallback", () => {
    it("non-blank title is passed through unchanged", async () => {
        createAlertMock.mockResolvedValue(createdAlert);

        const { result } = renderAlertSubmitHook({
            editedAutomation: { ...baseAutomation, title: "My custom title" },
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(createAlertMock).toHaveBeenCalledWith(expect.objectContaining({ title: "My custom title" }));
    });

    it("blank title gets the getDescription-derived title", async () => {
        createAlertMock.mockResolvedValue(createdAlert);

        const { result } = renderAlertSubmitHook({
            editedAutomation: automationNoTitle,
        });

        await act(async () => {
            await result.current.submit();
        });

        const callArg = createAlertMock.mock.calls[0][0];
        expect(callArg.title).toBe("Derived alert title");
    });
});

// ---------------------------------------------------------------------------
// Tests — undefined draft
// ---------------------------------------------------------------------------

describe("useAlertSubmit — undefined draft", () => {
    it("submit is a no-op when editedAutomation is undefined", async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();

        const { result } = renderAlertSubmitHook({
            editedAutomation: undefined,
            onSuccess,
            onError,
        });

        await act(async () => {
            await result.current.submit();
        });

        expect(createAlertMock).not.toHaveBeenCalled();
        expect(saveAlertMock).not.toHaveBeenCalled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
    });
});

// ---------------------------------------------------------------------------
// Tests — loading toggle
// ---------------------------------------------------------------------------

describe("useAlertSubmit — loading toggle", () => {
    it("isSaving is true while the backend promise is pending and false after it resolves", async () => {
        let resolveCreate!: (value: IAutomationMetadataObject) => void;
        createAlertMock.mockReturnValue(
            new Promise<IAutomationMetadataObject>((resolve) => {
                resolveCreate = resolve;
            }),
        );

        const { result } = renderAlertSubmitHook({});

        act(() => {
            void result.current.submit();
        });

        expect(result.current.isSaving).toBe(true);

        await act(async () => {
            resolveCreate(createdAlert);
        });

        expect(result.current.isSaving).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Tests — re-entrancy guard
// ---------------------------------------------------------------------------

describe("useAlertSubmit — re-entrancy guard", () => {
    it("second submit() while in-flight invokes the backend mock exactly once", async () => {
        let resolveCreate!: (value: IAutomationMetadataObject) => void;
        const pendingCreate = new Promise<IAutomationMetadataObject>((resolve) => {
            resolveCreate = resolve;
        });
        createAlertMock.mockReturnValue(pendingCreate);

        const onSuccess = vi.fn();
        const { result } = renderAlertSubmitHook({ onSuccess });

        // Both calls from the same closure, before any state flush — this is
        // the real double-submit window the synchronous ref guard must block.
        await act(async () => {
            void result.current.submit();
            void result.current.submit();
        });

        expect(createAlertMock).toHaveBeenCalledTimes(1);

        // Resolve the in-flight request
        await act(async () => {
            resolveCreate(createdAlert);
        });

        expect(onSuccess).toHaveBeenCalledTimes(1);
    });
});
