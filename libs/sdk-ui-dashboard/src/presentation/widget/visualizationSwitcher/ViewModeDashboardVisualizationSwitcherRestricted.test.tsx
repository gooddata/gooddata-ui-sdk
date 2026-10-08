// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUnavailableDashboardReference } from "@gooddata/sdk-backend-spi";
import { type IInsightWidget, type IVisualizationSwitcherWidget, idRef } from "@gooddata/sdk-model";

import { restrictedDataSliceReducer } from "../../../model/store/restrictedData/index.js";
import { type DashboardState } from "../../../model/store/types.js";
import {
    unavailableObjectsActions,
    unavailableObjectsSliceReducer,
} from "../../../model/store/unavailableObjects/index.js";
import { type WidgetExportData } from "../../export/types.js";

const mockUseDashboardSelector = vi.fn();
const mockContentProvider = vi.fn();
const mockDispatch = vi.fn();

// `isolate: false` shares one module graph per worker, so the module mocked below may already have
// been evaluated against its real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: (selector: unknown) => mockUseDashboardSelector(selector),
    useDashboardDispatch: () => mockDispatch,
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

function renderRestricted(exportData?: WidgetExportData) {
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
        restrictedData: restrictedDataSliceReducer(undefined, { type: "init" }),
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
                exportData={exportData}
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
        mockDispatch.mockReset();
    });

    it("reports the restricted active visualization as rendered, so a dashboard export does not wait for it", () => {
        renderRestricted();

        expect(mockDispatch.mock.calls.map(([command]) => [command.type, command.payload.id])).toEqual([
            ["GDC.DASH/CMD.RENDER.ASYNC.REQUEST", "restricted"],
            ["GDC.DASH/CMD.RENDER.ASYNC.RESOLVE", "restricted"],
        ]);
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

        expect(container.querySelector(".gd-ui-kit-restricted-placeholder")).toBeInTheDocument();
    });

    it("gives the content the positioned box an absolute container measures against", () => {
        // asserted through a consumer's content: an absolutely sized replacement resolves its height
        // against the nearest positioned ancestor, which has to be the switcher body and not the tile
        function AbsolutelyPositionedContent() {
            return <div className="gd-visualization-content">consumer content</div>;
        }
        mockContentProvider.mockImplementation(() => AbsolutelyPositionedContent);

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

    it("gives a slides export one finished content element, without the withheld visualization's type", () => {
        const { container } = renderRestricted({
            section: { "data-export-type": "widget" },
            widget: {
                "data-export-type": "widget-content",
                "data-export-visualization-type": "table",
                "data-export-visualization-dimension-0": "Attrition by team",
            },
            title: { "data-export-type": "widget-title" },
        });

        const contents = container.querySelectorAll('[data-export-type="widget-content"]');
        expect(contents).toHaveLength(1);
        expect(contents[0]).toHaveAttribute("data-export-visualization-status", "loaded");
        expect(contents[0]).toContainElement(screen.getByTestId("restricted-placeholder"));
        expect(container.querySelector("[data-export-visualization-type]")).toBeNull();
        // the exportable wrapper around the switcher already marks the widget; a second mark would
        // make the exporter count the switcher twice
        expect(container.querySelector('[data-export-type="widget"]')).toBeNull();
    });
});
