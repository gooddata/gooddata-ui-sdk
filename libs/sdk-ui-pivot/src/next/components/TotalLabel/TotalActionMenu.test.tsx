// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { createIntlMock } from "@gooddata/sdk-ui";

import { TotalActionMenu } from "./TotalActionMenu.js";

const intl = createIntlMock({
    "visualizations.totals.labelActions.aria": "Total label actions",
    "visualizations.totals.renameLabel.action": "Rename label…",
    "visualizations.totals.resetLabel.action": "Reset to default",
});

function renderMenu(onRenameClick = vi.fn(), onResetClick = vi.fn(), onClose = vi.fn()) {
    const anchor = document.createElement("div");
    document.body.appendChild(anchor);

    render(
        <IntlProvider locale="en-US" messages={{}}>
            <TotalActionMenu
                intl={intl}
                anchor={anchor}
                onRenameClick={onRenameClick}
                onResetClick={onResetClick}
                onClose={onClose}
            />
        </IntlProvider>,
    );

    return document.querySelector<HTMLElement>('[role="menu"]')!;
}

function activeDescendantText(menu: HTMLElement): string | null {
    const activeId = menu.getAttribute("aria-activedescendant");
    return activeId ? (document.getElementById(activeId)?.textContent ?? null) : null;
}

describe("TotalActionMenu", () => {
    it("moves real DOM focus into the menu on open, not just onto its first item's virtual pointer", () => {
        const menu = renderMenu();

        expect(document.activeElement).toBe(menu);
    });

    it("moves the active item to Reset on ArrowDown, then back to Rename on ArrowUp", () => {
        const menu = renderMenu();

        expect(activeDescendantText(menu)).toBe("Rename label…");

        fireEvent.keyDown(document.activeElement!, { code: "ArrowDown" });
        expect(activeDescendantText(menu)).toBe("Reset to default");

        fireEvent.keyDown(document.activeElement!, { code: "ArrowUp" });
        expect(activeDescendantText(menu)).toBe("Rename label…");
    });

    it("activates the Reset item reached via ArrowDown with Enter", () => {
        const onResetClick = vi.fn();
        renderMenu(vi.fn(), onResetClick);

        fireEvent.keyDown(document.activeElement!, { code: "ArrowDown" });
        fireEvent.keyDown(document.activeElement!, { code: "Enter" });

        expect(onResetClick).toHaveBeenCalledTimes(1);
    });

    it("clicking Rename does not also close the menu (which would drop the parent's mode transition)", () => {
        const onRenameClick = vi.fn();
        const onClose = vi.fn();
        renderMenu(onRenameClick, vi.fn(), onClose);

        fireEvent.click(screen.getByText("Rename label…"));

        expect(onRenameClick).toHaveBeenCalledTimes(1);
        expect(onClose).not.toHaveBeenCalled();
    });
});
