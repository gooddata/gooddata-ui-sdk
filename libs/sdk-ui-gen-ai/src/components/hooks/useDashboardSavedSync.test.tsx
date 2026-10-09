// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { dashboardSavedAction } from "../../store/messages/messagesSlice.js";

import { type IDashboardSaved, useDashboardSavedSync } from "./useDashboardSavedSync.js";

const saved = (seq: number, savedDashboardId = "saved-dashboard"): IDashboardSaved => ({
    seq,
    conversationId: "conversation",
    originalDashboardId: "draft-dashboard",
    savedDashboardId,
    savedInsights: [
        {
            originalInsightId: "draft-insight",
            savedInsightId: "saved-insight",
        },
    ],
});

describe("useDashboardSavedSync", () => {
    it("tells the chat store what dashboard objects were saved", () => {
        const dispatch = vi.fn<(action: unknown) => void>();

        renderHook(() => useDashboardSavedSync(dispatch, saved(1)));

        expect(dispatch).toHaveBeenCalledWith(
            dashboardSavedAction({
                conversationId: "conversation",
                originalDashboardId: "draft-dashboard",
                savedDashboardId: "saved-dashboard",
                savedInsights: [
                    {
                        originalInsightId: "draft-insight",
                        savedInsightId: "saved-insight",
                    },
                ],
            }),
        );
    });

    it("dispatches once for each sequence", () => {
        const dispatch = vi.fn<(action: unknown) => void>();
        const { rerender } = renderHook(({ dashboard }) => useDashboardSavedSync(dispatch, dashboard), {
            initialProps: { dashboard: saved(1) },
        });

        rerender({ dashboard: saved(1) });
        rerender({ dashboard: saved(2, "next-dashboard") });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({ savedDashboardId: "next-dashboard" }),
            }),
        );
    });
});
