// (C) 2026 GoodData Corporation

import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../test/render.js";
import { UiToolbarIconButton } from "../UiToolbarIconButton/UiToolbarIconButton.js";

import { TOOLBAR_TOOLTIP_OPEN_DELAY } from "./constants.js";
import { UiToolbar } from "./UiToolbar.js";

function tooltip() {
    return screen.queryByRole("tooltip", { hidden: true });
}

function renderToolbar() {
    return render(
        <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
            <UiToolbarIconButton icon="bold" label="Bold" />
            <UiToolbarIconButton icon="italic" label="Italic" />
        </UiToolbar>,
    );
}

const COLD_TIMEOUT = TOOLBAR_TOOLTIP_OPEN_DELAY * 3;

describe("UiToolbarItemTooltip", () => {
    it("opens after the delay on hover and is hidden from assistive technology", async () => {
        const { user } = renderToolbar();
        const start = Date.now();

        await user.hover(screen.getByRole("button", { name: "Bold" }));
        expect(tooltip()).toBeNull();

        await waitFor(() => expect(tooltip()).toHaveTextContent("Bold"), { timeout: COLD_TIMEOUT });
        expect(Date.now() - start).toBeGreaterThanOrEqual(TOOLBAR_TOOLTIP_OPEN_DELAY - 50);
        expect(tooltip()).toHaveAttribute("aria-hidden", "true");
    });

    it("opens the next item instantly while the toolbar is warm and closes on click", async () => {
        const { user } = renderToolbar();
        const italic = screen.getByRole("button", { name: "Italic" });

        await user.hover(screen.getByRole("button", { name: "Bold" }));
        await waitFor(() => expect(tooltip()).toHaveTextContent("Bold"), { timeout: COLD_TIMEOUT });

        await user.hover(italic);
        await waitFor(() => expect(tooltip()).toHaveTextContent("Italic"), {
            timeout: TOOLBAR_TOOLTIP_OPEN_DELAY / 2,
        });

        await user.click(italic);
        await waitFor(() => expect(tooltip()).toBeNull());
    });

    it("does not open when the item is clicked during the hover delay", async () => {
        const { user } = renderToolbar();
        const bold = screen.getByRole("button", { name: "Bold" });

        await user.hover(bold);
        await user.click(bold);

        await new Promise((resolve) => setTimeout(resolve, COLD_TIMEOUT));
        expect(tooltip()).toBeNull();
    });

    it("does not reappear after the item's popup closes", async () => {
        function Harness({ isActive }: { isActive: boolean }) {
            return (
                <UiToolbar accessibilityConfig={{ ariaLabel: "Formatting" }}>
                    <UiToolbarIconButton icon="bold" label="Bold" isActive={isActive} />
                </UiToolbar>
            );
        }
        const { user, rerender } = render(<Harness isActive={false} />);

        // Focus opens the tooltip. Opening the popup by keyboard never produces a click on the
        // anchor, so nothing closes it; only the isActive flag hides it.
        await user.tab();
        await waitFor(() => expect(tooltip()).not.toBeNull(), { timeout: COLD_TIMEOUT });

        rerender(<Harness isActive />);
        await waitFor(() => expect(tooltip()).toBeNull());

        rerender(<Harness isActive={false} />);
        await new Promise((resolve) => setTimeout(resolve, 150));
        expect(tooltip()).toBeNull();
    });

    it("closes on Escape", async () => {
        const { user } = renderToolbar();

        await user.hover(screen.getByRole("button", { name: "Bold" }));
        await waitFor(() => expect(tooltip()).not.toBeNull(), { timeout: COLD_TIMEOUT });

        await user.keyboard("{Escape}");
        await waitFor(() => expect(tooltip()).toBeNull());
    });
});
