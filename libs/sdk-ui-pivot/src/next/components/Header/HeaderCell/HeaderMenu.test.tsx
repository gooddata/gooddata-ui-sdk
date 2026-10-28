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

function TestHeaderMenu({ withWrapping = false }: { withWrapping?: boolean }) {
    const [isMenuOpened, onMenuOpenedChange] = useState(false);
    const [wrapCells, setWrapCells] = useState(true);
    const [wrapHeaders, setWrapHeaders] = useState(false);
    return (
        <IntlProvider
            locale="en-US"
            messages={{
                "visualizations.menu.header.openAriaLabel": "Open header menu",
                "visualizations.menu.sort": "Sort",
                "visualizations.menu.textWrapping": "Wrap Text",
            }}
        >
            <HeaderMenuProvider>
                <HeaderMenu
                    aggregationsItems={[]}
                    textWrappingItems={
                        withWrapping
                            ? [
                                  {
                                      type: "textWrapping",
                                      id: "header",
                                      title: "Headers",
                                      isActive: wrapHeaders,
                                  },
                                  { type: "textWrapping", id: "cell", title: "Cells", isActive: wrapCells },
                              ]
                            : []
                    }
                    sortingItems={[
                        { type: "sorting", id: "asc", title: "Ascending", isActive: false, direction: "asc" },
                        {
                            type: "sorting",
                            id: "desc",
                            title: "Descending",
                            isActive: withWrapping,
                            direction: "desc",
                        },
                    ]}
                    onAggregationsItemClick={vi.fn()}
                    onTextWrappingItemClick={(item) => {
                        if (item.id === "cell") {
                            setWrapCells((value) => !value);
                        } else {
                            setWrapHeaders((value) => !value);
                        }
                    }}
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

describe("HeaderMenu selection accessibility", () => {
    it("exposes wrapping states and hides decorative checkmarks", async () => {
        render(<TestHeaderMenu withWrapping />);
        fireEvent.click(screen.getByRole("button", { name: "Open header menu" }));

        const cells = await screen.findByRole("menuitemcheckbox", { name: "Cells", checked: true });
        expect(screen.getByRole("menuitemcheckbox", { name: "Headers", checked: false })).toBeInTheDocument();
        expect(cells.querySelector(".gd-icon-checkmark")).toHaveAttribute("aria-hidden", "true");
        expect(
            screen.getByRole("menuitem", { name: "Descending" }).querySelector(".gd-icon-checkmark"),
        ).toHaveAttribute("aria-hidden", "true");
    });

    it.each(["Enter", " "])("toggles Cells with %s and restores focus", async (key) => {
        render(<TestHeaderMenu withWrapping />);
        const trigger = screen.getByRole("button", { name: "Open header menu" });
        trigger.focus();
        fireEvent.click(trigger);
        const menu = await screen.findByRole("menu");
        await waitFor(() => expect(menu).toHaveFocus());

        fireEvent.keyDown(menu, { key: "End", code: "End" });
        expect(menu).toHaveAttribute(
            "aria-activedescendant",
            screen.getByRole("menuitemcheckbox", { name: "Cells", checked: true }).id,
        );
        fireEvent.keyDown(menu, { key, code: key === " " ? "Space" : "Enter" });
        await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
        await waitFor(() => expect(trigger).toHaveFocus());

        fireEvent.click(trigger);
        expect(
            await screen.findByRole("menuitemcheckbox", { name: "Cells", checked: false }),
        ).toBeInTheDocument();
        expect(screen.getByRole("menuitemcheckbox", { name: "Headers", checked: false })).toBeInTheDocument();
    });
});
