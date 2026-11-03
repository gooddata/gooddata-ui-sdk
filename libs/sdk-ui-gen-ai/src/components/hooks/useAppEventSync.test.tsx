// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IAiAssistantAppEvent,
    aiAssistantDashboardSaved,
    aiAssistantPublisherDocumentSaved,
} from "@gooddata/sdk-pluggable-application-model";

import { dashboardSavedAction, publisherDocumentSavedAction } from "../../store/messages/messagesSlice.js";

import { type ISequencedAppEvent, useAppEventSync } from "./useAppEventSync.js";

const documentSaved = (seq: number, savedDocumentId = "r1"): ISequencedAppEvent => ({
    seq,
    event: aiAssistantPublisherDocumentSaved({
        conversationId: "c1",
        itemId: "i1",
        documentRef: "report_1",
        savedDocumentId,
    }).payload,
});

const dashboardSaved = (seq: number): ISequencedAppEvent => ({
    seq,
    event: aiAssistantDashboardSaved({
        conversationId: "conversation",
        originalDashboardId: "draft-dashboard",
        savedDashboardId: "saved-dashboard",
        savedInsights: [{ originalInsightId: "draft-insight", savedInsightId: "saved-insight" }],
    }).payload,
});

describe("useAppEventSync", () => {
    it("tells the chat store that a document was saved", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useAppEventSync(dispatch, [documentSaved(1)]));

        expect(dispatch).toHaveBeenCalledExactlyOnceWith(
            publisherDocumentSavedAction({
                conversationId: "c1",
                itemId: "i1",
                documentRef: "report_1",
                savedDocumentId: "r1",
            }),
        );
    });

    it("tells the chat store what dashboard objects were saved", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useAppEventSync(dispatch, [dashboardSaved(1)]));

        expect(dispatch).toHaveBeenCalledExactlyOnceWith(
            dashboardSavedAction({
                conversationId: "conversation",
                originalDashboardId: "draft-dashboard",
                savedDashboardId: "saved-dashboard",
                savedInsights: [{ originalInsightId: "draft-insight", savedInsightId: "saved-insight" }],
            }),
        );
    });

    it("tells it once per delivery, however often the component renders", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ appEvents }) => useAppEventSync(dispatch, appEvents), {
            initialProps: { appEvents: [documentSaved(1)] },
        });

        rerender({ appEvents: [documentSaved(1)] });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("tells it again for the next delivery, and only for that one", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const first = documentSaved(1);
        const { rerender } = renderHook(({ appEvents }) => useAppEventSync(dispatch, appEvents), {
            initialProps: { appEvents: [first] },
        });

        rerender({ appEvents: [first, documentSaved(2, "r2")] });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith(
            expect.objectContaining({ payload: expect.objectContaining({ savedDocumentId: "r2" }) }),
        );
    });

    it("tells it every delivery that arrived in one render, in order", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useAppEventSync(dispatch, [documentSaved(1), dashboardSaved(2)]));

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[0]![0]).toEqual(
            expect.objectContaining({ type: publisherDocumentSavedAction.type }),
        );
        expect(dispatch.mock.calls[1]![0]).toEqual(
            expect.objectContaining({ type: dashboardSavedAction.type }),
        );
    });

    it("waits for the chat store, then tells it", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ target }) => useAppEventSync(target, [documentSaved(1)]), {
            initialProps: { target: null as typeof dispatch | null },
        });

        expect(dispatch).not.toHaveBeenCalled();
        rerender({ target: dispatch });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("ignores an event it does not know, and a known one with a wrong payload", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const unknown: IAiAssistantAppEvent = { name: "app.something-else", payload: { any: 1 } };
        const malformed: IAiAssistantAppEvent = {
            name: "app.publisher-document-saved",
            payload: { conversationId: 1 },
        };

        renderHook(() =>
            useAppEventSync(dispatch, [
                { seq: 1, event: unknown },
                { seq: 2, event: malformed },
            ]),
        );

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("does nothing without events", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useAppEventSync(dispatch, []));

        expect(dispatch).not.toHaveBeenCalled();
    });
});
