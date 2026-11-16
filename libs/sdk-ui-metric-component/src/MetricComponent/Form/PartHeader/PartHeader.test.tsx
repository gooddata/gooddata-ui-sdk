// (C) 2026 GoodData Corporation

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mountWithIntlComponent } from "../../../tests/render.test.utils.js";

import { PartHeader } from "./PartHeader.js";

const LABEL = "More actions for the metric definition";

function renderHeader(dropdownLabel: string | undefined, areTitlesShown = false) {
    const onAutoFormat = vi.fn();
    const onShowTitles = vi.fn();

    mountWithIntlComponent(
        <>
            <PartHeader
                TitleContent={<span>Metric definition</span>}
                dropdownLabel={dropdownLabel}
                dropdown={[
                    {
                        type: "link",
                        title: "Auto format",
                        // a description and keys, as the metric definition's item has them
                        tooltip: "Format metric expression (Shift+Alt+F)",
                        keyShortcuts: "Shift+Alt+F",
                        onClick: onAutoFormat,
                    },
                    { type: "separator" },
                    { type: "link", title: "Show titles", checked: areTitlesShown, onClick: onShowTitles },
                ]}
            />
            {/* the control after the header in the page, the formula editor in the metric editor */}
            <button type="button">Next control</button>
        </>,
    );

    return { onAutoFormat, onShowTitles };
}

const press = (element: Element, key: string, init: Record<string, unknown> = {}) =>
    fireEvent.keyDown(element, { key, code: key, ...init });

const focusedItem = (menu: HTMLElement) =>
    document.getElementById(menu.getAttribute("aria-activedescendant") ?? "");

async function openWithEnter(button: HTMLElement) {
    button.focus();
    press(button, "Enter");

    await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "true"));
    const menu = await screen.findByRole("menu");
    await waitFor(() => expect(document.activeElement).toBe(menu));

    return menu;
}

describe("PartHeader dropdown", () => {
    it("names the button, hides the glyph and exposes a closed menu button", () => {
        renderHeader(LABEL);
        const button = screen.getByRole("button", { name: LABEL });

        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveAttribute("aria-haspopup", "menu");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button.querySelector('[aria-hidden="true"]')).toHaveTextContent("⋯");
    });

    it("falls back to a generic name when the header gives none", () => {
        renderHeader(undefined);

        expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
    });

    it("opens the menu with Enter, with the focus on the first item", async () => {
        renderHeader(LABEL);

        const menu = await openWithEnter(screen.getByRole("button", { name: LABEL }));

        expect(focusedItem(menu)).toHaveTextContent("Auto format");
        // the test hook the e2e helpers click (METRIC_DIALOG_AUTOFORMAT_BUTTON_SELECTOR)
        expect(focusedItem(menu)).toHaveAttribute("data-testid", "s-auto_format");
    });

    it("moves between the items with the arrow keys and runs the focused one with Enter", async () => {
        const { onAutoFormat, onShowTitles } = renderHeader(LABEL);
        const button = screen.getByRole("button", { name: LABEL });
        const menu = await openWithEnter(button);

        press(menu, "ArrowDown");
        await waitFor(() => expect(focusedItem(menu)).toHaveTextContent("Show titles"));
        press(menu, "Enter");

        expect(onShowTitles).toHaveBeenCalledTimes(1);
        expect(onAutoFormat).not.toHaveBeenCalled();
        await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));
    });

    it("closes the menu with Escape and returns the focus to the button", async () => {
        renderHeader(LABEL);
        const button = screen.getByRole("button", { name: LABEL });
        const menu = await openWithEnter(button);

        press(menu, "Escape");

        await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));
        await waitFor(() => expect(document.activeElement).toBe(button));
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it.each([
        ["the first item (with a description and keys)", 0],
        ["the toggle", 1],
    ])("closes the menu with one Escape, whichever item is active: %s", async (_name, downs) => {
        renderHeader(LABEL);
        const button = screen.getByRole("button", { name: LABEL });
        const menu = await openWithEnter(button);
        for (let i = 0; i < downs; i++) {
            press(menu, "ArrowDown");
        }

        press(menu, "Escape");

        await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));
        await waitFor(() => expect(document.activeElement).toBe(button));
        expect(screen.queryByRole("menu")).toBeNull();
    });

    it("closes the menu on Tab and moves the focus to the next control after the button", async () => {
        renderHeader(LABEL);
        const menu = await openWithEnter(screen.getByRole("button", { name: LABEL }));

        press(menu, "Tab");

        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next control" }));
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    });

    it("closes the menu on Shift+Tab and returns the focus to the button", async () => {
        renderHeader(LABEL);
        const button = screen.getByRole("button", { name: LABEL });
        const menu = await openWithEnter(button);

        press(menu, "Tab", { shiftKey: true });

        expect(document.activeElement).toBe(button);
        await waitFor(() => expect(button).toHaveAttribute("aria-expanded", "false"));
    });

    it("exposes a toggle as a menu checkbox with its state", async () => {
        renderHeader(LABEL, true);
        const menu = await openWithEnter(screen.getByRole("button", { name: LABEL }));

        const toggle = screen.getByRole("menuitemcheckbox", { name: "Show titles" });

        expect(toggle).toHaveAttribute("aria-checked", "true");
        // checked is not where the menu starts: it opens on its first item all the same
        expect(focusedItem(menu)).toHaveTextContent("Auto format");
    });

    it("names the item by its title, with its description and keys apart", async () => {
        renderHeader(LABEL);
        await openWithEnter(screen.getByRole("button", { name: LABEL }));

        const item = screen.getByRole("menuitem", { name: "Auto format" });

        expect(item).toHaveAttribute("aria-keyshortcuts", "Shift+Alt+F");
        expect(item).toHaveAccessibleDescription("Format metric expression (Shift+Alt+F)");
    });
});
