// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IInsight, type IInsightWidget, idRef } from "@gooddata/sdk-model";

const insightRef = idRef("insight-1", "insight");

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker,
// which would turn the `vi.mock()` calls into no-ops.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => new Map([[insightRef, { insight: { ref: insightRef } } as IInsight]]),
}));

vi.mock("../../../../model/react/useIsWidgetRestricted.js", () => ({
    useIsInsightWidgetRestricted: () => () => true,
}));

const { VisualizationConfig } = await import("./VisualizationConfig.js");

const widget = { type: "insight", ref: idRef("widget-1"), insight: insightRef } as IInsightWidget;

describe("VisualizationConfig", () => {
    it("offers no configuration for an entry whose data the user may not read", () => {
        const { container } = render(
            <VisualizationConfig widget={widget} onVisualizationDeleted={() => {}} />,
        );

        expect(container).toBeEmptyDOMElement();
    });
});
