// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { RawIntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState } from "@gooddata/sdk-ui-kit";

import { type DraggableContentItemType } from "../../dragAndDrop/types.js";
import { createInternalIntl } from "../../localization/createInternalIntl.js";

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: () => false,
}));

vi.mock("./DraggableInsightList/DraggableInsightList.js", () => ({
    DraggableInsightList: () => null,
}));

const sidebar: IUiResizableSidebarState = {
    width: 230,
    expandedWidth: 230,
    min: 230,
    max: 500,
    canResize: true,
    setWidth: vi.fn(),
    canCollapse: true,
    hasRail: true,
    isCollapsed: false,
    setCollapsed: vi.fn(),
};

vi.mock("./useResizableSidebarState.js", () => ({
    useResizableSidebar: () => sidebar,
}));

const { CreationPanel } = await import("./CreationPanel.js");

function componentSet<T>(type: DraggableContentItemType, label: string) {
    return {
        creating: {
            type,
            CreatePanelListItemComponent: () => <div>{label}</div>,
        },
    } as unknown as T;
}

function panel() {
    return (
        <RawIntlProvider value={createInternalIntl()}>
            <CreationPanel
                InsightWidgetComponentSet={componentSet("insight-placeholder", "insight item")}
                AttributeFilterComponentSet={componentSet("attributeFilter-placeholder", "filter item")}
                DashboardLayoutWidgetComponentSet={componentSet("dashboardLayoutListItem", "layout item")}
                VisualizationSwitcherWidgetComponentSet={componentSet(
                    "visualizationSwitcherListItem",
                    "switcher item",
                )}
                RichTextWidgetComponentSet={componentSet("richTextListItem", "rich text item")}
            />
        </RawIntlProvider>
    );
}

describe("CreationPanel", () => {
    beforeEach(() => {
        sidebar.isCollapsed = false;
        sidebar.hasRail = true;
    });

    it("names the palette item on hover once the panel is only an icon rail", async () => {
        sidebar.isCollapsed = true;
        render(panel());

        await userEvent.setup().hover(screen.getByText("insight item"));

        expect(await screen.findByText("Visualization")).toBeInTheDocument();
    });

    it("stays quiet when the panel collapses under a pointer that rests on an item", async () => {
        const { rerender } = render(panel());

        await userEvent.setup().hover(screen.getByText("insight item"));
        sidebar.isCollapsed = true;
        rerender(panel());

        await expect(screen.findByText("Visualization")).rejects.toThrow();
    });

    it("offers the rail search shortcut only when the sidebar collapses to a rail", () => {
        const { rerender } = render(panel());
        expect(screen.getByRole("button", { name: "Search visualizations" })).toBeInTheDocument();

        sidebar.hasRail = false;
        rerender(panel());
        expect(screen.queryByRole("button", { name: "Search visualizations" })).not.toBeInTheDocument();
    });
});
