// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { selectIsInExportMode } from "../../../model/store/renderMode/renderModeSelectors.js";

const mockIsExportMode = vi.fn<() => boolean>();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker,
// which would turn the `vi.mock()` call into a no-op.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) =>
        selector === selectIsInExportMode ? mockIsExportMode() : undefined,
}));

vi.mock("../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        InsightWidgetComponentSet: { MainComponentProvider: () => null },
        ErrorComponent: ({ message }: { message: string }) => <div className="error-stand-in">{message}</div>,
    }),
}));

const { DashboardInsight } = await import("./DashboardInsight.js");

const widget: IInsightWidget = {
    type: "insight",
    insight: idRef("deleted-insight", "insight"),
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Deleted visualization",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

function renderMissingInsight() {
    return render(
        <IntlProvider locale="en-US" messages={{}} onError={() => {}}>
            <DashboardInsight
                widget={widget}
                ErrorComponent={() => null}
                LoadingComponent={() => null}
                exportData={{ "data-export-type": "widget-content", "data-export-widget-type": "insight" }}
            />
        </IntlProvider>,
    );
}

describe("DashboardInsight with a missing insight", () => {
    beforeEach(() => {
        mockIsExportMode.mockReset();
    });

    it("gives an export a finished content element, so a slides export does not wait for it", () => {
        mockIsExportMode.mockReturnValue(true);
        const { container } = renderMissingInsight();

        const content = container.querySelector("[data-export-type='widget-content']");
        expect(content?.getAttribute("data-export-visualization-status")).toBe("error");
        expect(content?.querySelector(".error-stand-in")).not.toBeNull();
    });

    it("renders only the error outside an export", () => {
        mockIsExportMode.mockReturnValue(false);
        const { container } = renderMissingInsight();

        expect(container.querySelector("[data-export-type]")).toBeNull();
        expect(container.firstElementChild?.className).toBe("error-stand-in");
    });
});
