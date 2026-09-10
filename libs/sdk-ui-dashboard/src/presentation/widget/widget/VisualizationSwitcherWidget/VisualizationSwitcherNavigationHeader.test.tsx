// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsightWidget, type IVisualizationSwitcherWidget, idRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../../model/store/unavailableObjects/index.js";

const mockUseDashboardSelector = vi.fn();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn(),
}));

const { VisualizationSwitcherNavigationHeader } = await import("./VisualizationSwitcherNavigationHeader.js");

function visualization(identifier: string, title: string): IInsightWidget {
    return {
        type: "insight",
        insight: idRef(`insight-${identifier}`, "insight"),
        ref: idRef(identifier),
        uri: `/${identifier}`,
        identifier,
        title,
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
    };
}

const readable = visualization("readable", "Revenue by month");
const restricted = visualization("restricted", "Attrition by team");

const switcher: IVisualizationSwitcherWidget = {
    type: "visualizationSwitcher",
    visualizations: [readable, restricted],
    ref: idRef("switcher-1"),
    uri: "/switcher-1",
    identifier: "switcher-1",
    title: "",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const messages = { "visualizationSwitcher.restrictedEntry": "Restricted" };

function renderHeader(activeVisualization: IInsightWidget) {
    const restrictedRef: IUnavailableDashboardReference = {
        ref: restricted.insight,
        type: "insight",
        reason: "forbidden",
    };
    const state = {
        unavailableObjects: unavailableObjectsSliceReducer(
            undefined,
            unavailableObjectsActions.setUnavailableObjects([restrictedRef]),
        ),
    } as unknown as DashboardState;

    mockUseDashboardSelector.mockImplementation((selector: (state: DashboardState) => unknown) =>
        selector(state),
    );

    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <VisualizationSwitcherNavigationHeader
                widget={switcher}
                activeVisualization={activeVisualization}
                onActiveVisualizationChange={vi.fn()}
                titleId="title-1"
                clientWidth={400}
                clientHeight={300}
            />
        </IntlProvider>,
    );
}

describe("VisualizationSwitcherNavigationHeader", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
    });

    // react-lines-ellipsis renders the headline twice — the visible element plus a hidden
    // measuring canvas — so the text is matched by getAllByText rather than getByText
    it("shows the real title in the closed header for a readable active entry", () => {
        renderHeader(readable);

        expect(screen.getAllByText("Revenue by month").length).toBeGreaterThan(0);
    });

    it("shows Restricted instead of the stored title when the active entry is restricted", () => {
        renderHeader(restricted);

        expect(screen.getAllByText("Restricted").length).toBeGreaterThan(0);
        // the stored title names the object the user may not see
        expect(screen.queryByText("Attrition by team")).not.toBeInTheDocument();
    });

    it("marks the closed header of a restricted active entry with a lock", () => {
        const { container } = renderHeader(restricted);

        expect(
            container.querySelector(".gd-visualization-switcher-widget-header-title svg"),
        ).toBeInTheDocument();
    });

    it("leaves the closed header of a readable active entry unmarked", () => {
        const { container } = renderHeader(readable);

        expect(
            container.querySelector(".gd-visualization-switcher-widget-header-title svg"),
        ).not.toBeInTheDocument();
    });
});
