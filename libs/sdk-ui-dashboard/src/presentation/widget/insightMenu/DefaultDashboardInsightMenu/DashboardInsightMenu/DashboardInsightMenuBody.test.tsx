// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { type IInsightMenuItem } from "../../types.js";

import { DashboardInsightMenuBody } from "./index.js";

const widget: IInsightWidget = {
    type: "insight",
    insight: idRef("insight-1", "insight"),
    ref: idRef("widget-1"),
    uri: "/widget-1",
    identifier: "widget-1",
    title: "Revenue",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};

const exploreItem: IInsightMenuItem = {
    type: "button",
    itemId: "Explore",
    itemName: "Explore from here",
    tooltip: "",
    icon: "gd-icon-explore",
    disabled: false,
    onClick: vi.fn(),
};

const disabledReason = "Unable to schedule the export. Please resave the dashboard.";
const disabledScheduleItem: IInsightMenuItem = {
    type: "button",
    itemId: "ScheduleExport",
    itemName: "Schedule export",
    tooltip: disabledReason,
    icon: "gd-icon-clock",
    disabled: true,
    onClick: vi.fn(),
};

const disabledSubmenuReason = "Configuration is not available for this widget.";
const disabledSubmenuItem: IInsightMenuItem = {
    type: "submenu",
    itemId: "Configure",
    itemName: "Configure",
    tooltip: disabledSubmenuReason,
    disabled: true,
    SubmenuComponent: () => null,
};

function appendButton(name: string) {
    const button = document.createElement("button");
    button.textContent = name;
    return document.body.appendChild(button);
}

// with controls on both sides of the opener, where Tab lands after the menu closes is observable
function appendOpenerBetweenTwoButtons() {
    return { before: appendButton("Before"), opener: appendButton("Opener"), after: appendButton("After") };
}

function renderMenuOpenedFrom(opener: HTMLElement, items: IInsightMenuItem[] = [exploreItem]) {
    opener.focus();
    const onClose = vi.fn();
    render(
        <IntlProvider
            locale="en-US"
            messages={{ "menu.close": "Close", "insightMenu.restrictedWidget.options": "Widget options" }}
        >
            <DashboardInsightMenuBody
                items={items}
                widget={widget}
                isOpen
                onClose={onClose}
                renderMode="view"
                showTitle={false}
            />
        </IntlProvider>,
    );
    return { onClose };
}

describe("DashboardInsightMenuBody", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("closes and continues the Tab order from its opener when Tab leaves the menu", async () => {
        const user = userEvent.setup();
        const { opener, after } = appendOpenerBetweenTwoButtons();
        const { onClose } = renderMenuOpenedFrom(opener);
        // without the title header, the item list is the menu's only focus stop
        screen.getByRole("menu", { name: "Widget options" }).focus();

        await user.tab();

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(after).toHaveFocus();
    });

    it("closes and continues the Tab order from its opener when Shift+Tab leaves the menu", async () => {
        const user = userEvent.setup();
        const { before, opener } = appendOpenerBetweenTwoButtons();
        const { onClose } = renderMenuOpenedFrom(opener);
        screen.getByRole("menu", { name: "Widget options" }).focus();

        await user.tab({ shift: true });

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(before).toHaveFocus();
    });

    it("names a disabled item by its label and exposes the disabled reason once as its description", async () => {
        const user = userEvent.setup();
        const { opener } = appendOpenerBetweenTwoButtons();
        renderMenuOpenedFrom(opener, [exploreItem, disabledScheduleItem]);
        screen.getByRole("menu", { name: "Widget options" }).focus();

        await user.keyboard("{ArrowDown}");

        const item = screen.getByRole("menuitem", { name: "Schedule export" });
        expect(item).toHaveAttribute("aria-disabled", "true");
        expect(item).toHaveAccessibleName("Schedule export");
        expect(item).toHaveAccessibleDescription(disabledReason);

        const describedBy = item.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
        expect(document.getElementById(describedBy!)).toHaveTextContent(disabledReason);
        // the reason is rendered only once inside the item
        expect(item.textContent?.split(disabledReason)).toHaveLength(2);
    });

    it("names a disabled submenu item with a custom component by its label and describes it by the reason", () => {
        const { opener } = appendOpenerBetweenTwoButtons();
        renderMenuOpenedFrom(opener, [exploreItem, disabledSubmenuItem]);

        const item = screen.getByRole("menuitem", { name: "Configure" });
        expect(item).toHaveAttribute("aria-disabled", "true");
        expect(item).toHaveAccessibleName("Configure");
        expect(item).toHaveAccessibleDescription(disabledSubmenuReason);
        expect(item.textContent?.split(disabledSubmenuReason)).toHaveLength(2);
    });

    it("keeps the description reference a single id when the item id contains whitespace", () => {
        const { opener } = appendOpenerBetweenTwoButtons();
        renderMenuOpenedFrom(opener, [{ ...disabledScheduleItem, itemId: "custom schedule item" }]);

        const item = screen.getByRole("menuitem", { name: "Schedule export" });
        expect(item.getAttribute("aria-describedby")).not.toMatch(/\s/);
        expect(item).toHaveAccessibleDescription(disabledReason);
    });

    it("keeps description ids distinct for item ids that differ only in whitespace and underscores", () => {
        const otherReason = "Unable to create an alert. Please resave the dashboard.";
        const { opener } = appendOpenerBetweenTwoButtons();
        renderMenuOpenedFrom(opener, [
            { ...disabledScheduleItem, itemId: "custom schedule" },
            { ...disabledScheduleItem, itemId: "custom_schedule", itemName: "Alert", tooltip: otherReason },
        ]);

        const scheduleItem = screen.getByRole("menuitem", { name: "Schedule export" });
        const alertItem = screen.getByRole("menuitem", { name: "Alert" });
        expect(scheduleItem.getAttribute("aria-describedby")).not.toEqual(
            alertItem.getAttribute("aria-describedby"),
        );
        expect(scheduleItem).toHaveAccessibleDescription(disabledReason);
        expect(alertItem).toHaveAccessibleDescription(otherReason);
    });

    it("does not add a description to enabled items", () => {
        const { opener } = appendOpenerBetweenTwoButtons();
        renderMenuOpenedFrom(opener, [exploreItem, disabledScheduleItem]);

        const item = screen.getByRole("menuitem", { name: "Explore from here" });
        expect(item).not.toHaveAttribute("aria-describedby");
    });
});
