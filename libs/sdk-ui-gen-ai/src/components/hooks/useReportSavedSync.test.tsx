// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { reportSavedAction } from "../../store/messages/messagesSlice.js";

import { type IReportSaved, useReportSavedSync } from "./useReportSavedSync.js";

const saved = (seq: number, savedReportId = "r1"): IReportSaved => ({
    seq,
    conversationId: "c1",
    itemId: "i1",
    reportRef: "report_1",
    savedReportId,
});

describe("useReportSavedSync", () => {
    it("tells the chat store that the report was saved", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useReportSavedSync(dispatch, saved(1)));

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            reportSavedAction({
                conversationId: "c1",
                itemId: "i1",
                reportRef: "report_1",
                savedReportId: "r1",
            }),
        );
    });

    it("tells it once per save, however often the component renders", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ report }) => useReportSavedSync(dispatch, report), {
            initialProps: { report: saved(1) },
        });

        rerender({ report: { ...saved(1) } });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("tells it again for the next save", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ report }) => useReportSavedSync(dispatch, report), {
            initialProps: { report: saved(1) },
        });

        rerender({ report: saved(2, "r2") });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith(
            expect.objectContaining({ payload: expect.objectContaining({ savedReportId: "r2" }) }),
        );
    });

    it("waits for the chat store, then tells it", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ target }) => useReportSavedSync(target, saved(1)), {
            initialProps: { target: null as typeof dispatch | null },
        });

        expect(dispatch).not.toHaveBeenCalled();
        rerender({ target: dispatch });

        expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it("does nothing without a save", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useReportSavedSync(dispatch, undefined));

        expect(dispatch).not.toHaveBeenCalled();
    });
});
