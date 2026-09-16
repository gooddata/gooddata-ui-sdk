// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsightWidget, type IVisualizationSwitcherWidget, idRef } from "@gooddata/sdk-model";

import { insightsActions, insightsSliceReducer } from "../../../model/store/insights/index.js";
import { type DashboardState } from "../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../model/store/unavailableObjects/index.js";

const mockUseDashboardSelector = vi.fn();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn(),
}));

vi.mock("../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        RestrictedPlaceholderComponentProvider: () => PlaceholderStandIn,
    }),
}));

vi.mock("./useExecutionProgress.js", () => ({
    useExecutionProgress: () => ({ showOthers: false }),
}));

function PlaceholderStandIn() {
    return <div>no access to this visualization</div>;
}

const { EditModeDashboardVisualizationSwitcher } =
    await import("./EditModeDashboardVisualizationSwitcher.js");

const restrictedInsight = idRef("insight-restricted", "insight");

const entry: IInsightWidget = {
    type: "insight",
    insight: restrictedInsight,
    ref: idRef("entry-1"),
    uri: "/entry-1",
    identifier: "entry-1",
    title: "Attrition by team",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const widget: IVisualizationSwitcherWidget = {
    type: "visualizationSwitcher",
    visualizations: [entry],
    ref: idRef("switcher-1"),
    uri: "/switcher-1",
    identifier: "switcher-1",
    title: "",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const messages = {
    "visualizationSwitcher.restrictedEntry": "Restricted",
    "visualizationSwitcher.emptyContent": "Add visualizations to this switcher",
};

function renderSwitcher() {
    const restricted: IUnavailableDashboardReference = {
        ref: restrictedInsight,
        type: "insight",
        reason: "forbidden",
    };
    const state = {
        unavailableObjects: unavailableObjectsSliceReducer(
            undefined,
            unavailableObjectsActions.setUnavailableObjects([restricted]),
        ),
        insights: insightsSliceReducer(undefined, insightsActions.setInsights([])),
        backendCapabilities: { backendCapabilities: { hasTypeScopedIdentifiers: true } },
    } as unknown as DashboardState;

    mockUseDashboardSelector.mockImplementation((selector: (state: DashboardState) => unknown) =>
        selector(state),
    );

    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <EditModeDashboardVisualizationSwitcher
                widget={widget}
                activeVisualizationId="entry-1"
                screen="xl"
            />
        </IntlProvider>,
    );
}

describe("EditModeDashboardVisualizationSwitcher", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
    });

    it("shows the access placeholder rather than claiming the switcher is empty", () => {
        renderSwitcher();

        expect(screen.getByText("no access to this visualization")).toBeInTheDocument();
        expect(screen.queryByText("Add visualizations to this switcher")).not.toBeInTheDocument();
    });

    it("keeps the label the closed title carries in view mode, and never the stored one", () => {
        renderSwitcher();

        // react-lines-ellipsis renders the headline twice, hence getAllByText
        expect(screen.getAllByText("Restricted").length).toBeGreaterThan(0);
        expect(screen.queryByText("Attrition by team")).not.toBeInTheDocument();
    });
});
