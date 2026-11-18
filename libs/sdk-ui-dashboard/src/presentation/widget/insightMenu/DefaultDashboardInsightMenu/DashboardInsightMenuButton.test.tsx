// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { type IInsightWidget, idRef } from "@gooddata/sdk-model";

import { type IInsightMenuItem } from "../types.js";

import { DashboardInsightMenuButton } from "./DashboardInsightMenuButton.js";

const messages = {
    "controlButtons.options.tooltip": "More actions",
    "controlButtons.options.widgetLabel": "More actions for {title}",
};

function createWidget(id: string, title: string): IInsightWidget {
    return {
        type: "insight",
        insight: idRef("insight-1", "insight"),
        ref: idRef(id),
        uri: `/${id}`,
        identifier: id,
        title,
        description: "",
        drills: [],
        ignoreDashboardFilters: [],
    };
}

const exploreItem: IInsightMenuItem = {
    type: "button",
    itemId: "Explore",
    itemName: "Explore from here",
    tooltip: "",
    icon: "gd-icon-explore",
    disabled: false,
    onClick: vi.fn(),
};

function renderButtons(widgets: IInsightWidget[], isOpen = false, onClick = vi.fn()) {
    render(
        <IntlProvider locale="en-US" messages={messages}>
            {widgets.map((widget) => (
                <DashboardInsightMenuButton
                    key={widget.identifier}
                    widget={widget}
                    items={[exploreItem]}
                    isOpen={isOpen}
                    onClick={onClick}
                />
            ))}
        </IntlProvider>,
    );
    return { onClick };
}

describe("DashboardInsightMenuButton", () => {
    it("is named after its widget, so buttons of different widgets differ", () => {
        renderButtons([createWidget("w1", "Activity by day of week"), createWidget("w2", "Revenue")]);

        expect(
            screen.getByRole("button", { name: "More actions for Activity by day of week" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "More actions for Revenue" })).toBeInTheDocument();
    });

    it("falls back to a generic name for a widget without a title", () => {
        renderButtons([createWidget("w1", "")]);

        expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
    });

    it("announces that it opens a menu and reflects its expanded state", () => {
        renderButtons([createWidget("w1", "Revenue")], true);

        const button = screen.getByRole("button", { name: "More actions for Revenue" });
        expect(button).toHaveAttribute("aria-haspopup", "menu");
        expect(button).toHaveAttribute("aria-expanded", "true");
    });

    it("opens the menu with Enter and Space", async () => {
        const user = userEvent.setup();
        const { onClick } = renderButtons([createWidget("w1", "Revenue")]);
        const button = screen.getByRole("button", { name: "More actions for Revenue" });
        expect(button).toHaveAttribute("aria-expanded", "false");

        button.focus();
        await user.keyboard("{Enter}");
        await user.keyboard(" ");

        expect(onClick).toHaveBeenCalledTimes(2);
    });
});
