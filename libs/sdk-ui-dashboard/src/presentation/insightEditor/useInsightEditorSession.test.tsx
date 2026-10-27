// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { act, renderHook } from "@testing-library/react";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IInsight, idRef, newInsightDefinition } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";

import { eagerRemoveNestedLayoutSectionItem } from "../../model/commands/layout.js";
import { insightEditorCancelled, insightEditorInsightSaved } from "../../model/events/insightEditor.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { useDashboardEventDispatch } from "../../model/react/useDashboardEventDispatch.js";
import { dispatchAndWaitFor } from "../../model/store/_infra/dispatchAndWaitFor.js";
import { selectSettings } from "../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../model/store/renderMode/renderModeSelectors.js";
import { selectInsightWidgetPlaceholderPath } from "../../model/store/tabs/layout/layoutSelectors.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

import { useInsightEditorSession } from "./useInsightEditorSession.js";

vi.mock("../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardDispatch: vi.fn<() => unknown>(),
    useDashboardSelector: vi.fn<() => unknown>(),
}));
vi.mock("../../model/react/useDashboardEventDispatch.js", () => ({
    useDashboardEventDispatch: vi.fn<() => unknown>(),
}));
vi.mock("../../model/store/_infra/dispatchAndWaitFor.js", () => ({
    dispatchAndWaitFor: vi.fn<() => unknown>(),
}));
const addError = vi.fn<(message: unknown) => void>();
vi.mock("@gooddata/sdk-ui-kit", async (importOriginal) => ({
    ...(await importOriginal<object>()),
    useToastMessage: () => ({ addError }),
}));

const PLACEHOLDER_PATH = [{ sectionIndex: 0, itemIndex: 1 }];
const TARGET: InsightEditorTarget = { type: "placeholder" };
const INSIGHT: IInsight = {
    insight: {
        ...newInsightDefinition("local:bar").insight,
        identifier: "saved",
        uri: "/saved",
        ref: idRef("saved", "insight"),
    },
};

const removeType = eagerRemoveNestedLayoutSectionItem(PLACEHOLDER_PATH).type;
const cancelledType = insightEditorCancelled(TARGET).type;
const savedType = insightEditorInsightSaved(TARGET, INSIGHT).type;

let dispatch: Mock<(action: unknown) => unknown>;
let eventDispatch: Mock<(event: unknown) => void>;

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function renderSession(getInsight: () => Promise<IInsight>) {
    const backend = {
        workspace: () => ({ insights: () => ({ getInsight }) }),
    } as unknown as IAnalyticalBackend;
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <BackendProvider backend={backend}>
                <WorkspaceProvider workspace="ws">{children}</WorkspaceProvider>
            </BackendProvider>
        );
    }
    return renderHook(() => useInsightEditorSession(TARGET), { wrapper: Wrapper }).result;
}

const dispatchedTypes = () => dispatch.mock.calls.map(([action]) => (action as { type: string }).type);
const eventTypes = () => eventDispatch.mock.calls.map(([event]) => (event as { type: string }).type);

describe("useInsightEditorSession", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        dispatch = vi.fn<(action: unknown) => unknown>();
        eventDispatch = vi.fn<(event: unknown) => void>();
        vi.mocked(useDashboardDispatch).mockReturnValue(
            dispatch as unknown as ReturnType<typeof useDashboardDispatch>,
        );
        vi.mocked(useDashboardEventDispatch).mockReturnValue(eventDispatch);
        vi.mocked(useDashboardSelector).mockImplementation((selector: unknown) => {
            if (selector === selectIsInEditMode) return true;
            if (selector === selectInsightWidgetPlaceholderPath) return PLACEHOLDER_PATH;
            if (selector === selectSettings) return {};
            return undefined;
        });
        vi.mocked(dispatchAndWaitFor).mockResolvedValue({ payload: { items: [] } });
    });

    it("ignores a cancellation that arrives while the save loads the insight", async () => {
        const loaded = deferred<IInsight>();
        const session = renderSession(() => loaded.promise);

        let saving!: Promise<void>;
        act(() => {
            saving = session.current.save("saved");
            session.current.cancel();
        });
        await act(async () => {
            loaded.resolve(INSIGHT);
            await saving;
        });

        expect(dispatchedTypes()).not.toContain(removeType);
        expect(dispatchAndWaitFor).toHaveBeenCalledTimes(1);
        expect(eventTypes()).toEqual([savedType]);
    });

    it("ignores a save after the cancellation", async () => {
        const session = renderSession(() => Promise.resolve(INSIGHT));

        await act(async () => {
            session.current.cancel();
            await session.current.save("saved");
        });

        expect(dispatchAndWaitFor).not.toHaveBeenCalled();
        expect(eventTypes()).toEqual([cancelledType]);
    });

    it("reports the saved insight and an error when its placement fails", async () => {
        vi.mocked(dispatchAndWaitFor).mockRejectedValue(new Error("rejected"));
        vi.spyOn(console, "error").mockImplementation(() => {});
        const session = renderSession(() => Promise.resolve(INSIGHT));

        await act(() => session.current.save("saved"));

        expect(eventTypes()).toEqual([savedType]);
        expect(dispatchedTypes()).toContain(removeType);
        expect(addError).toHaveBeenCalledTimes(1);
    });

    it("keeps a placeholder that another target did not create", async () => {
        const widgetTarget: InsightEditorTarget = { type: "widget", ref: idRef("widget") };
        const backend = { workspace: () => ({}) } as unknown as IAnalyticalBackend;
        function Wrapper({ children }: PropsWithChildren) {
            return (
                <BackendProvider backend={backend}>
                    <WorkspaceProvider workspace="ws">{children}</WorkspaceProvider>
                </BackendProvider>
            );
        }
        const session = renderHook(() => useInsightEditorSession(widgetTarget), { wrapper: Wrapper }).result;

        act(() => session.current.cancel());

        expect(dispatchedTypes()).not.toContain(removeType);
    });

    it("reports a cancellation and an error when the saved insight does not load", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const session = renderSession(() => Promise.reject(new Error("offline")));

        await act(() => session.current.save("saved"));

        expect(eventTypes()).toEqual([cancelledType]);
        expect(dispatchedTypes()).toContain(removeType);
        expect(addError).toHaveBeenCalledTimes(1);
    });
});
