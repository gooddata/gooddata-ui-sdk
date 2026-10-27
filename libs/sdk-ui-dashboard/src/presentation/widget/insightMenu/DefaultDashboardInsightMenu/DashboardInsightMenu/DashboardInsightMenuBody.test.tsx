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

function appendButton(name: string) {
    const button = document.createElement("button");
    button.textContent = name;
    return document.body.appendChild(button);
}

// with controls on both sides of the opener, where Tab lands after the menu closes is observable
function appendOpenerBetweenTwoButtons() {
    return { before: appendButton("Before"), opener: appendButton("Opener"), after: appendButton("After") };
}

function renderMenuOpenedFrom(opener: HTMLElement) {
    opener.focus();
    const onClose = vi.fn();
    render(
        <IntlProvider
            locale="en-US"
            messages={{ "menu.close": "Close", "insightMenu.restrictedWidget.options": "Widget options" }}
        >
            <DashboardInsightMenuBody
                items={[exploreItem]}
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
});
