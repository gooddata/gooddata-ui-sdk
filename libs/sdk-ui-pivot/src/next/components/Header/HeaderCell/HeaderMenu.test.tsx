// (C) 2026 GoodData Corporation

import { useState } from "react";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { HeaderMenuProvider } from "../../../context/HeaderMenuContext.js";

import { HeaderMenu } from "./HeaderMenu.js";

vi.hoisted(() => {
    vi.resetModules();
});

function TestHeaderMenu() {
    const [isMenuOpened, onMenuOpenedChange] = useState(false);
    return (
        <IntlProvider
            locale="en-US"
            messages={{
                "visualizations.menu.header.openAriaLabel": "Open header menu",
                "visualizations.menu.sort": "Sort",
            }}
        >
            <HeaderMenuProvider>
                <HeaderMenu
                    aggregationsItems={[]}
                    textWrappingItems={[]}
                    sortingItems={[
                        { type: "sorting", id: "asc", title: "Ascending", isActive: false, direction: "asc" },
                        {
                            type: "sorting",
                            id: "desc",
                            title: "Descending",
                            isActive: false,
                            direction: "desc",
                        },
                    ]}
                    onAggregationsItemClick={vi.fn()}
                    onTextWrappingItemClick={vi.fn()}
                    onSortingItemClick={vi.fn()}
                    isMenuOpened={isMenuOpened}
                    onMenuOpenedChange={onMenuOpenedChange}
                />
            </HeaderMenuProvider>
        </IntlProvider>
    );
}

describe("HeaderMenu focus", () => {
    it.each(["Enter", " "])("does not pass %s activation to the native grid header listener", (key) => {
        const { container } = render(<TestHeaderMenu />);
        const onHeaderKeyDown = vi.fn();
        container.addEventListener("keydown", onHeaderKeyDown);
        const trigger = screen.getByRole("button", { name: "Open header menu" });

        expect(fireEvent.keyDown(trigger, { key })).toBe(true);
        expect(onHeaderKeyDown).not.toHaveBeenCalled();
        container.removeEventListener("keydown", onHeaderKeyDown);
    });

    it.each([0, 1])("focuses the first item after button activation with click detail %i", async (detail) => {
        render(<TestHeaderMenu />);
        const trigger = screen.getByRole("button", { name: "Open header menu" });
        trigger.focus();
        fireEvent.click(trigger, { detail });

        const menu = await screen.findByRole("menu");
        await waitFor(() => expect(menu).toHaveFocus());
        expect(menu).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("menuitem", { name: "Ascending" }).id,
        );
        fireEvent.keyDown(document.activeElement!, { key: "ArrowDown", code: "ArrowDown" });
        expect(menu).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("menuitem", { name: "Descending" }).id,
        );
        fireEvent.keyDown(document.activeElement!, { key: "Escape", code: "Escape" });
        await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
        await waitFor(() => expect(trigger).toHaveFocus());
    });
});
