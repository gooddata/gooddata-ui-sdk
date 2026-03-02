// (C) 2026 GoodData Corporation

import { render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IInsight, idRef, newAttribute, newMeasure } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { type ILayerTableDefinition } from "./insightToTable.js";
import { type ILayeredTableViewProps, LayeredTableView } from "./LayeredTableView.js";

// ---------------------------------------------------------------------------
// Mock InsightRenderer — we only care about tab structure, not actual chart
// ---------------------------------------------------------------------------

vi.mock("@gooddata/sdk-ui-ext", () => ({
    InsightRenderer: (props: { insight: IInsight }) => (
        <div data-testid="insight-renderer">{props.insight.insight.title}</div>
    ),
}));

// ---------------------------------------------------------------------------
// Mock UiTabs — renders a minimal tab structure we can test against
// ---------------------------------------------------------------------------

vi.mock("@gooddata/sdk-ui-kit", () => ({
    UiTabs: (props: {
        tabs: Array<{ id: string; label: string; panelId?: string; tabId?: string; ariaLabel?: string }>;
        selectedTabId: string;
        onTabSelect: (tab: { id: string; label: string }) => void;
        accessibilityConfig?: { ariaLabel?: string; role?: string; tabRole?: string };
    }) => (
        <div
            role={props.accessibilityConfig?.role ?? "tablist"}
            aria-label={props.accessibilityConfig?.ariaLabel}
            data-testid="ui-tabs"
        >
            {props.tabs.map((tab) => (
                <button
                    key={tab.id}
                    id={tab.tabId}
                    role={props.accessibilityConfig?.tabRole ?? "tab"}
                    aria-selected={tab.id === props.selectedTabId}
                    aria-controls={tab.panelId}
                    aria-label={tab.ariaLabel ?? tab.label}
                    onClick={() => props.onTabSelect(tab)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const messages: Record<string, string> = {
    "geochart.alternateView.tablist.label": "Layer tables",
};

function makeTableInsight(title: string): IInsight {
    return {
        insight: {
            title,
            visualizationUrl: "local:table",
            buckets: [
                { localIdentifier: BucketNames.MEASURES, items: [newMeasure(idRef("m1"))] },
                {
                    localIdentifier: BucketNames.ATTRIBUTE,
                    items: [newAttribute(idRef("a1", "displayForm"))],
                },
                { localIdentifier: BucketNames.COLUMNS, items: [] },
            ],
            filters: [],
            sorts: [],
            properties: {},
            identifier: title,
            uri: `/${title}`,
            ref: idRef(title),
        },
    };
}

function createLayerTables(count: number): ILayerTableDefinition[] {
    return Array.from({ length: count }, (_, i) => ({
        layerId: i === 0 ? "root" : `layer-${i}`,
        layerName: `Layer ${i + 1}`,
        layerType: i % 2 === 0 ? ("pushpin" as const) : ("area" as const),
        tableInsight: makeTableInsight(`Layer ${i + 1}`),
    }));
}

const baseProps: Omit<ILayeredTableViewProps, "layerTables"> = {
    backend: {} as ILayeredTableViewProps["backend"],
    workspace: "test-ws",
    widget: {} as ILayeredTableViewProps["widget"],
    drillableItems: undefined,
    colorPalette: undefined,
    config: {},
    locale: "en-US",
    ErrorComponent: () => <div>Error</div>,
    LoadingComponent: () => <div>Loading</div>,
    settings: undefined,
};

function renderComponent(layerTables: ILayerTableDefinition[]) {
    return render(
        <IntlProvider locale="en-US" messages={messages}>
            <LayeredTableView {...baseProps} layerTables={layerTables} />
        </IntlProvider>,
    );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LayeredTableView", () => {
    it("renders UiTabs with correct number of tabs", () => {
        renderComponent(createLayerTables(3));

        expect(screen.getByTestId("ui-tabs")).toBeInTheDocument();
        expect(screen.getAllByRole("tab")).toHaveLength(3);
    });

    it("passes accessible label to UiTabs", () => {
        renderComponent(createLayerTables(2));

        expect(screen.getByTestId("ui-tabs")).toHaveAttribute("aria-label", "Layer tables");
    });

    it("renders tabpanel for active layer", () => {
        renderComponent(createLayerTables(3));

        const panel = screen.getByRole("tabpanel");
        expect(panel).toBeInTheDocument();
        expect(screen.getByTestId("insight-renderer")).toHaveTextContent("Layer 1");
    });

    it("renders one panel per tab and keeps only active panel visible", () => {
        renderComponent(createLayerTables(3));

        const panels = screen.getAllByRole("tabpanel", { hidden: true });
        expect(panels).toHaveLength(3);
        expect(panels[0]).not.toHaveAttribute("hidden");
        expect(panels[1]).toHaveAttribute("hidden");
        expect(panels[2]).toHaveAttribute("hidden");
    });

    it("first tab is selected by default", () => {
        renderComponent(createLayerTables(3));

        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    });

    it("clicking a tab switches the active panel", async () => {
        const { userEvent } = await import("@testing-library/user-event");
        const user = userEvent.setup();
        renderComponent(createLayerTables(3));

        await user.click(screen.getAllByRole("tab")[1]);

        expect(screen.getByTestId("insight-renderer")).toHaveTextContent("Layer 2");
    });

    it("tab labels show layer names", () => {
        renderComponent(createLayerTables(2));

        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toHaveTextContent("Layer 1");
        expect(tabs[1]).toHaveTextContent("Layer 2");
    });

    it("tabs have aria-controls pointing to panel id", () => {
        renderComponent(createLayerTables(2));

        const panels = screen.getAllByRole("tabpanel", { hidden: true });
        const panelMap = new Map(panels.map((panel) => [panel.id, panel]));
        const tabs = screen.getAllByRole("tab");

        tabs.forEach((tab) => {
            const panelId = tab.getAttribute("aria-controls");
            expect(panelId).toBeTruthy();
            expect(tab).toHaveAttribute("id");
            expect(panelMap.has(panelId!)).toBe(true);
            const panel = panelMap.get(panelId!)!;
            expect(panel).toHaveAttribute("aria-labelledby", tab.getAttribute("id"));
        });
    });

    it("applies layered table view layout classes", () => {
        renderComponent(createLayerTables(2));

        const container = screen.getByTestId("ui-tabs").parentElement!;
        expect(container).toHaveClass("gd-layered-table-view");
        expect(container.querySelector(".gd-layered-table-view__panels")).not.toBeNull();
    });

    it("moves focus to active panel after tab activation", async () => {
        const { userEvent } = await import("@testing-library/user-event");
        const user = userEvent.setup();
        renderComponent(createLayerTables(3));

        const tabs = screen.getAllByRole("tab");
        await user.click(tabs[1]);

        const panels = screen.getAllByRole("tabpanel", { hidden: true });
        const activePanel = panels[1];
        expect(activePanel).not.toHaveAttribute("hidden");
        await waitFor(() => expect(activePanel).toHaveFocus());
    });
});
