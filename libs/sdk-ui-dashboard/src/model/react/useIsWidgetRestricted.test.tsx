// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsightWidget, type IRichTextWidget, idRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../store/unavailableObjects/index.js";
import { type ExtendedDashboardWidget } from "../types/layoutTypes.js";

const mockUseDashboardSelector = vi.fn();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker,
// which would turn the `vi.mock()` call into a no-op.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("./DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
}));

const { useIsWidgetRestricted } = await import("./useIsWidgetRestricted.js");

const insightRef = idRef("insight-1", "insight");

const insightWidget: IInsightWidget = {
    type: "insight",
    insight: insightRef,
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Confidential revenue",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const richTextWidget: IRichTextWidget = {
    type: "richText",
    content: "just text",
    ref: idRef("widget-2"),
    uri: "/widget-2",
    identifier: "widget-2",
    title: "",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

function renderWith(
    widget: ExtendedDashboardWidget,
    ...unavailableObjects: IUnavailableDashboardReference[]
) {
    const state = {
        unavailableObjects: unavailableObjectsSliceReducer(
            undefined,
            unavailableObjectsActions.setUnavailableObjects(unavailableObjects),
        ),
    } as unknown as DashboardState;

    mockUseDashboardSelector.mockImplementation((selector: (state: DashboardState) => unknown) =>
        selector(state),
    );

    return renderHook(() => useIsWidgetRestricted(widget)).result.current;
}

describe("useIsWidgetRestricted", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
    });

    it("reports an insight widget whose insight the user may not see", () => {
        expect(renderWith(insightWidget, { ref: insightRef, type: "insight", reason: "forbidden" })).toBe(
            true,
        );
    });

    it("does not report an insight widget whose insight is available", () => {
        expect(renderWith(insightWidget)).toBe(false);
    });

    it("does not report an insight widget whose insight is only missing", () => {
        expect(renderWith(insightWidget, { ref: insightRef, type: "insight", reason: "notFound" })).toBe(
            false,
        );
    });

    it("does not report a widget that renders no insight", () => {
        expect(renderWith(richTextWidget, { ref: insightRef, type: "insight", reason: "forbidden" })).toBe(
            false,
        );
    });
});
