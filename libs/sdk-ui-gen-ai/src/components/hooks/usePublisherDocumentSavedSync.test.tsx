// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { publisherDocumentSavedAction } from "../../store/messages/messagesSlice.js";

import {
    type IPublisherDocumentSaved,
    usePublisherDocumentSavedSync,
} from "./usePublisherDocumentSavedSync.js";

const saved = (seq: number, savedDocumentId = "r1"): IPublisherDocumentSaved => ({
    seq,
    conversationId: "c1",
    itemId: "i1",
    documentRef: "report_1",
    savedDocumentId,
});

describe("usePublisherDocumentSavedSync", () => {
    it("tells the chat store that the document was saved", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => usePublisherDocumentSavedSync(dispatch, saved(1)));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            publisherDocumentSavedAction({
                conversationId: "c1",
                itemId: "i1",
                documentRef: "report_1",
                savedDocumentId: "r1",
            }),
        );
    });

    it("tells it once per save, however often the component renders", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(
            ({ documentSaved }) => usePublisherDocumentSavedSync(dispatch, documentSaved),
            {
                initialProps: { documentSaved: saved(1) },
            },
        );

        rerender({ documentSaved: { ...saved(1) } });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("tells it again for the next save", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(
            ({ documentSaved }) => usePublisherDocumentSavedSync(dispatch, documentSaved),
            {
                initialProps: { documentSaved: saved(1) },
            },
        );

        rerender({ documentSaved: saved(2, "r2") });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith(
            expect.objectContaining({ payload: expect.objectContaining({ savedDocumentId: "r2" }) }),
        );
    });

    it("waits for the chat store, then tells it", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ target }) => usePublisherDocumentSavedSync(target, saved(1)), {
            initialProps: { target: null as typeof dispatch | null },
        });

        expect(dispatch).not.toHaveBeenCalled();
        rerender({ target: dispatch });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("does nothing without a save", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => usePublisherDocumentSavedSync(dispatch, undefined));

        expect(dispatch).not.toHaveBeenCalled();
    });
});
