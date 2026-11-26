// (C) 2026 GoodData Corporation

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IntlWrapper } from "../../localization/IntlWrapper.js";

import { DefaultMenuButton } from "./DefaultMenuButton.js";
import { type IMenuButtonItem } from "./types.js";

// `isolate: false` shares one module graph per worker, so drop it before this file's imports
// resolve, otherwise the mock below may be a no-op.
vi.hoisted(() => {
    vi.resetModules();
});

vi.mock("../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn(() => undefined),
}));

const menuItems: IMenuButtonItem[] = [
    { type: "button", itemId: "save-as", itemName: "Save as new" },
    { type: "button", itemId: "summarize", itemName: "Summarize", warning: "Partial results" },
    {
        type: "menu",
        itemId: "export",
        itemName: "Export",
        items: [
            { type: "button", itemId: "pdf", itemName: "Snapshot (.pdf)" },
            { type: "button", itemId: "pptx", itemName: "Slides (.pptx)" },
        ],
    },
    { type: "button", itemId: "schedule", itemName: "Schedule export" },
];

function renderMenuButton() {
    return render(
        <IntlWrapper locale="en-US">
            <DefaultMenuButton menuItems={menuItems} DefaultMenuButton={DefaultMenuButton} />
        </IntlWrapper>,
    );
}

const getTrigger = () => screen.getByTestId("s-header-options-button");
const getItem = (name: string) => screen.getByRole("menuitem", { name: new RegExp(`^${name}`) });

// Mimics the browser: focus does not move into the Overlay while it is hidden before alignment.
const originalFocus = HTMLElement.prototype.focus;

describe("DefaultMenuButton", () => {
    beforeEach(() => {
        HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions) {
            const overlay = this.closest<HTMLElement>(".overlay-wrapper");
            if (overlay?.style.visibility === "hidden") {
                return;
            }
            originalFocus.call(this, options);
        };
    });

    afterEach(() => {
        HTMLElement.prototype.focus = originalFocus;
    });

    it("moves focus to the first menu item when the menu opens", async () => {
        renderMenuButton();
        const trigger = getTrigger();
        trigger.focus();

        fireEvent.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        await waitFor(() => expect(getItem("Save as new")).toHaveFocus());
    });

    it("moves focus by exactly one item on each Down Arrow", async () => {
        renderMenuButton();
        fireEvent.click(getTrigger());
        await waitFor(() => expect(getItem("Save as new")).toHaveFocus());

        fireEvent.keyDown(document.activeElement!, { code: "ArrowDown", key: "ArrowDown" });
        expect(getItem("Summarize")).toHaveFocus();

        // let the focus tooltip of the item with a warning open and re-render the item
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        fireEvent.keyDown(document.activeElement!, { code: "ArrowDown", key: "ArrowDown" });
        expect(getItem("Export")).toHaveFocus();
    });

    it("opens the menu with Down Arrow on the trigger and focuses the first item", async () => {
        renderMenuButton();
        const trigger = getTrigger();
        trigger.focus();

        fireEvent.keyDown(trigger, { code: "ArrowDown", key: "ArrowDown" });

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        await waitFor(() => expect(getItem("Save as new")).toHaveFocus());

        // the focus stays on the first item, it is not advanced any further
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });
        expect(getItem("Save as new")).toHaveFocus();
    });

    it("opens the submenu with Right Arrow and returns to its parent with Left Arrow", async () => {
        renderMenuButton();
        fireEvent.click(getTrigger());
        await waitFor(() => expect(getItem("Save as new")).toHaveFocus());

        getItem("Export").focus();
        fireEvent.keyDown(getItem("Export"), { code: "ArrowRight", key: "ArrowRight" });
        await waitFor(() => expect(getItem("Snapshot \\(\\.pdf\\)")).toHaveFocus());

        fireEvent.keyDown(document.activeElement!, { code: "ArrowLeft", key: "ArrowLeft" });
        await waitFor(() => expect(getItem("Export")).toHaveFocus());
    });
});
