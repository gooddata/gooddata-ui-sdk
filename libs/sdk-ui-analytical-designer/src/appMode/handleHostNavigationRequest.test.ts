// (C) 2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateConfirmUnsavedChangesRequestAction } from "../actions/confirm_unsaved_changes_actions.js";
import { HOST_NAVIGATION } from "../constants/platform.js";

import { handleHostNavigationRequest } from "./handleHostNavigationRequest.js";
import { clearPendingHostNavigation, runPendingHostNavigation } from "./pendingHostNavigation.js";

vi.hoisted(() => {
    vi.resetModules();
});

const mocks = vi.hoisted(() => ({
    getState: vi.fn(),
    dispatch: vi.fn(),
    isReportChanging: vi.fn(),
    hasMetricEditorUnsavedChanges: vi.fn(),
}));

vi.mock("../reduxStore.js", () => ({
    store: { getState: mocks.getState, dispatch: mocks.dispatch },
}));

vi.mock("../selectors/confirm_unsaved_changes_dialog_selector.js", () => ({
    isReportChanging: mocks.isReportChanging,
}));

vi.mock("../store/metric_editor/metric_editor_selector.js", () => ({
    hasMetricEditorUnsavedChanges: mocks.hasMetricEditorUnsavedChanges,
}));

describe("handleHostNavigationRequest", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        clearPendingHostNavigation();
        mocks.isReportChanging.mockReturnValue(false);
        mocks.hasMetricEditorUnsavedChanges.mockReturnValue(false);
    });

    it("lets the host navigate when there is no unsaved work", () => {
        const proceed = vi.fn();

        expect(handleHostNavigationRequest({ url: "/workspace/ws2/analyze", proceed })).toBe(false);
        expect(mocks.dispatch).not.toHaveBeenCalled();
        expect(proceed).not.toHaveBeenCalled();
    });

    it.each([
        ["the report has unsaved changes", "isReportChanging"],
        ["the metric editor has unsaved changes", "hasMetricEditorUnsavedChanges"],
    ] as const)("takes the navigation over and asks for confirmation when %s", (_case, dirtySelector) => {
        mocks[dirtySelector].mockReturnValue(true);
        const proceed = vi.fn();

        expect(handleHostNavigationRequest({ url: "/workspace/ws2/analyze", proceed })).toBe(true);
        expect(mocks.dispatch).toHaveBeenCalledWith(
            CreateConfirmUnsavedChangesRequestAction({
                active: true,
                data: { goToPage: HOST_NAVIGATION },
            }),
        );
        expect(proceed).not.toHaveBeenCalled();
    });

    it("hands the host's proceed callback to the pending navigation, and runs it only once", () => {
        mocks.isReportChanging.mockReturnValue(true);
        const proceed = vi.fn();

        handleHostNavigationRequest({ url: "/workspace/ws2/analyze", proceed });
        runPendingHostNavigation();
        runPendingHostNavigation();

        expect(proceed).toHaveBeenCalledTimes(1);
    });

    it("replaces a pending navigation that was never confirmed", () => {
        mocks.isReportChanging.mockReturnValue(true);
        const abandoned = vi.fn();
        const latest = vi.fn();

        handleHostNavigationRequest({ url: "/workspace/ws2/analyze", proceed: abandoned });
        handleHostNavigationRequest({ url: "/workspace/ws3/analyze", proceed: latest });
        runPendingHostNavigation();

        expect(abandoned).not.toHaveBeenCalled();
        expect(latest).toHaveBeenCalledTimes(1);
    });

    it("drops a pending navigation once it is cleared", () => {
        mocks.isReportChanging.mockReturnValue(true);
        const proceed = vi.fn();

        handleHostNavigationRequest({ url: "/workspace/ws2/analyze", proceed });
        clearPendingHostNavigation();
        runPendingHostNavigation();

        expect(proceed).not.toHaveBeenCalled();
    });
});
