// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsightWidget, type IVisualizationSwitcherWidget, idRef } from "@gooddata/sdk-model";

import { type DashboardState } from "../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../model/store/unavailableObjects/index.js";

const mockUseDashboardSelector = vi.fn();
const mockContentProvider = vi.fn();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => vi.fn(),
}));

vi.mock("../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        RestrictedPlaceholderComponentProvider: mockContentProvider,
    }),
}));

const { ViewModeDashboardVisualizationSwitcherRestricted } =
    await import("./ViewModeDashboardVisualizationSwitcherRestricted.js");
const { RestrictedPlaceholderContent } = await import("../common/RestrictedPlaceholder.js");

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

const messages = {
    "visualizationSwitcher.restrictedEntry": "Restricted",
    "widget.error.restricted_insight.message": "No access to this visualization",
    "widget.error.restricted_insight.description": "Ask your administrator for access",
};

function renderRestricted() {
    const entry: IUnavailableDashboardReference = {
        ref: restricted.insight,
        type: "insight",
        reason: "forbidden",
    };
    const state = {
        unavailableObjects: unavailableObjectsSliceReducer(
            undefined,
            unavailableObjectsActions.setUnavailableObjects([entry]),
        ),
    } as unknown as DashboardState;

    mockUseDashboardSelector.mockImplementation((selector: (state: DashboardState) => unknown) =>
        selector(state),
    );

    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <ViewModeDashboardVisualizationSwitcherRestricted
                widget={switcher}
                activeVisualization={restricted}
                screen="xl"
                onActiveVisualizationChange={vi.fn()}
            />
        </IntlProvider>,
    );
}

describe("ViewModeDashboardVisualizationSwitcherRestricted", () => {
    beforeEach(() => {
        mockUseDashboardSelector.mockReset();
        mockContentProvider.mockReset();
        mockContentProvider.mockImplementation(() => RestrictedPlaceholderContent);
    });

    it("renders the consumer's replacement content in the switcher body", () => {
        function ConsumerContent() {
            return <div>consumer content</div>;
        }
        mockContentProvider.mockImplementation(() => ConsumerContent);

        renderRestricted();

        expect(screen.getByText("consumer content")).toBeInTheDocument();
        // the provider is asked about the restricted child, never handed its insight
        expect(mockContentProvider).toHaveBeenCalledWith(restricted);
    });

    it("shows the access placeholder in the switcher body", () => {
        const { container } = renderRestricted();

        expect(container.querySelector(".gd-icon-lock")).toBeInTheDocument();
    });

    it("gives the content the positioned box its absolute container measures against", () => {
        const { container } = renderRestricted();

        expect(
            container.querySelector(
                ".gd-visualization-switcher-visible-visualization > .visualization-content",
            ),
        ).toContainElement(container.querySelector(".gd-visualization-content"));
    });

    it("keeps the dropdown so the user can switch to a readable visualization", () => {
        renderRestricted();

        // the header is what carries the entry list; the closed title names the restricted entry
        expect(screen.getAllByText("Restricted").length).toBeGreaterThan(0);
        expect(screen.queryByText("Attrition by team")).not.toBeInTheDocument();
    });

    it("offers no widget menu, so there is no drill or export", () => {
        const { container } = renderRestricted();

        expect(container.querySelectorAll(".gd-absolute-row").length).toBe(0);
    });
});
