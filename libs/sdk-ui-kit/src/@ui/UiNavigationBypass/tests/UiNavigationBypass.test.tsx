// (C) 2025 GoodData Corporation

import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntlProvider } from "react-intl";
import { describe, it, expect, vi } from "vitest";
import { messagesMap, pickCorrectWording } from "@gooddata/sdk-ui";
import { UiNavigationBypass } from "../UiNavigationBypass.js";

describe("UiNavigationBypass", () => {
    const items = [
        { id: "id-1", name: "Link 1", targetId: "target-1", tabIndex: 1 },
        { id: "id-2", name: "Link 2", targetId: "target-2", tabIndex: 1 },
        { id: "id-3", name: "Link 3", targetId: "target-3" },
    ];

    const renderComponent = () => {
        const DefaultLocale = "en-US";
        const onItemClick = vi.fn();

        const messages = pickCorrectWording(messagesMap[DefaultLocale], {
            workspace: "mockWorkspace",
            enableRenamingMeasureToMetric: true,
        });

        const res = render(
            <IntlProvider key={DefaultLocale} locale={DefaultLocale} messages={messages}>
                <UiNavigationBypass items={items} label="Label" onItemClick={onItemClick} />
            </IntlProvider>,
        );

        return {
            res,
            onItemClick,
        };
    };

    it("render basic structure", () => {
        renderComponent();

        expect(screen.getByRole("menu")).toBeInTheDocument();

        const children = screen.getAllByRole("menuitem");
        expect(children.length).toBe(items.length);

        expect(children[0].tabIndex).toBe(items[0].tabIndex);
        expect(children[0].textContent).toBe(items[0].name);
        expect(children[1].tabIndex).toBe(items[1].tabIndex);
        expect(children[1].textContent).toBe(items[1].name);
        expect(children[2].tabIndex).toBe(0);
        expect(children[2].textContent).toBe(items[2].name);
    });

    it("check focus down move", async () => {
        renderComponent();

        const children = screen.getAllByRole("menuitem");

        expect(children[0]).not.toHaveFocus();

        children[0].focus();

        expect(children[0]).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        expect(children[1]).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        expect(children[2]).toHaveFocus();
        await userEvent.keyboard("{ArrowDown}");
        expect(children[0]).toHaveFocus();
    });

    it("check focus up move", async () => {
        renderComponent();

        const children = screen.getAllByRole("menuitem");

        expect(children[2]).not.toHaveFocus();

        children[2].focus();

        expect(children[2]).toHaveFocus();
        await userEvent.keyboard("{ArrowUp}");
        expect(children[1]).toHaveFocus();
        await userEvent.keyboard("{ArrowUp}");
        expect(children[0]).toHaveFocus();
        await userEvent.keyboard("{ArrowUp}");
        expect(children[2]).toHaveFocus();
    });

    it("check callback call with Enter", async () => {
        const { onItemClick } = renderComponent();

        expect(onItemClick).not.toHaveBeenCalled();

        const children = screen.getAllByRole("menuitem");
        children[1].focus();

        await userEvent.keyboard("{Enter}");
        expect(onItemClick).toHaveBeenCalledTimes(1);
        expect(onItemClick).toHaveBeenCalledWith(items[1]);
    });

    it("check callback call with Space", async () => {
        const { onItemClick } = renderComponent();

        expect(onItemClick).not.toHaveBeenCalled();

        const children = screen.getAllByRole("menuitem");
        children[1].focus();

        await userEvent.keyboard(" ");
        expect(onItemClick).toHaveBeenCalledTimes(1);
        expect(onItemClick).toHaveBeenCalledWith(items[1]);
    });
});
