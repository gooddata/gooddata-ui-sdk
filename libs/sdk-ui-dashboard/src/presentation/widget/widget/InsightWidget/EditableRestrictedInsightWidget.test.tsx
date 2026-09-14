// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { type IInsightMenuItem } from "../../insightMenu/types.js";

const mockSelection = vi.fn();
const mockMenuItems = vi.fn();
const mockPlaceholderProvider = vi.fn();

// `isolate: false` shares one module graph per worker, so the modules mocked below may already have
// been evaluated against their real dependencies by a test file that ran earlier in the same worker.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../../model/react/useWidgetSelection.js", () => ({
    useWidgetSelection: () => mockSelection(),
}));

vi.mock("./useEditableInsightMenu.js", () => ({
    useEditableInsightMenu: (config: unknown) => mockMenuItems(config),
}));

vi.mock("../../../dashboardContexts/DashboardComponentsContext.js", () => ({
    useDashboardComponentsContext: () => ({
        RestrictedPlaceholderComponentProvider: mockPlaceholderProvider,
    }),
}));

const { EditableRestrictedInsightWidget } = await import("./EditableRestrictedInsightWidget.js");

const widget: IInsightWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Confidential revenue",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const onRemove = vi.fn();
const removeItem: IInsightMenuItem = {
    type: "button",
    itemId: "InteractionPanelRemove",
    itemName: "Remove from dashboard",
    tooltip: "",
    icon: "gd-icon-trash",
    disabled: false,
    onClick: onRemove,
};

function PlaceholderStandIn() {
    return <div>no access to this visualization</div>;
}

const closeConfigPanel = vi.fn();
const onSelected = vi.fn();

function renderWidget({ hasConfigPanelOpen = false }: { hasConfigPanelOpen?: boolean } = {}) {
    mockSelection.mockReturnValue({
        isSelectable: true,
        isSelected: hasConfigPanelOpen,
        onSelected,
        closeConfigPanel,
        hasConfigPanelOpen,
    });

    return render(
        <IntlProvider
            locale="en-US"
            messages={{
                "menu.close": "Close",
                "insightMenu.restrictedWidget.options": "Restricted visualization options",
            }}
        >
            <EditableRestrictedInsightWidget
                widget={widget}
                screen="xl"
                dashboardItemClasses="s-dash-item-0"
            />
        </IntlProvider>,
    );
}

describe("EditableRestrictedInsightWidget", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPlaceholderProvider.mockImplementation(() => PlaceholderStandIn);
        mockMenuItems.mockReturnValue({ menuItems: [removeItem] });
    });

    it("shows the placeholder and never the stored title", () => {
        renderWidget();

        expect(screen.getByText("no access to this visualization")).toBeInTheDocument();
        expect(screen.queryByText("Confidential revenue")).not.toBeInTheDocument();
    });

    it("asks for the menu of a widget with no readable insight, which is removal alone", () => {
        renderWidget();

        expect(mockMenuItems).toHaveBeenCalledWith(expect.objectContaining({ widget, insight: undefined }));
    });

    it("removes the widget when the entry is chosen", () => {
        renderWidget({ hasConfigPanelOpen: true });

        fireEvent.click(screen.getByText("Remove from dashboard"));

        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("puts the entry in a menu that can be operated with the keyboard", () => {
        renderWidget({ hasConfigPanelOpen: true });

        // `hidden: true` because the overlay parks itself off-screen with visibility:hidden until it
        // has measured its anchor, which never happens without layout
        const menu = screen.getByRole("menu", { hidden: true });
        expect(screen.getByRole("menuitem", { hidden: true })).toHaveTextContent("Remove from dashboard");

        // the menu holds the focus and points at the item through aria-activedescendant, so the key
        // goes to the menu itself
        fireEvent.keyDown(menu, { code: "Enter" });

        expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it("names the menu without naming the widget", () => {
        renderWidget({ hasConfigPanelOpen: true });

        // the titleless header renders no element to point at, so the name has to be on the menu
        const menu = screen.getByRole("menu", { hidden: true });
        expect(menu).toHaveAttribute("aria-label", "Restricted visualization options");
        expect(menu).not.toHaveAttribute("aria-labelledby");
        expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute(
            "aria-label",
            "Restricted visualization options",
        );
    });

    it("offers no menu until the widget is selected", () => {
        renderWidget();

        expect(screen.queryByText("Remove from dashboard")).not.toBeInTheDocument();
    });
});
