// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";
import { UiToolbarColorSwatch } from "../UiToolbarColorSwatch/UiToolbarColorSwatch.js";

import { UiToolbarIconButton } from "./UiToolbarIconButton.js";

describe("UiToolbarIconButton", () => {
    it("renders an icon-only button named by its label", async () => {
        const onClick = vi.fn();
        const { user } = render(<UiToolbarIconButton icon="plus" label="Add" onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Add" });
        expect(button).toHaveAttribute("aria-label", "Add");
        expect(button).toHaveClass("gd-ui-kit-toolbar-icon-button--size-medium");
        expect(button.querySelector("svg")).not.toBeNull();

        await user.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders a custom icon node", () => {
        render(<UiToolbarIconButton icon={<UiToolbarColorSwatch color="red" />} label="Fill colour" />);

        const button = screen.getByRole("button", { name: "Fill colour" });
        expect(button.querySelector(".gd-ui-kit-toolbar-color-swatch")).not.toBeNull();
    });

    it("supports the small size and state modifiers", () => {
        render(<UiToolbarIconButton icon="minus" label="Zoom out" size="small" isSelected isDestructive />);

        const button = screen.getByRole("button", { name: "Zoom out" });
        expect(button).toHaveClass("gd-ui-kit-toolbar-icon-button--size-small");
        expect(button).toHaveClass("gd-ui-kit-toolbar-icon-button--isSelected");
        expect(button).toHaveClass("gd-ui-kit-toolbar-icon-button--isDestructive");
        expect(button).toHaveAttribute("aria-pressed", "true");
    });

    it("wraps the button in a tooltip anchor unless hidden", () => {
        const { rerender } = render(<UiToolbarIconButton icon="plus" label="Add" />);
        expect(
            screen.getByRole("button", { name: "Add" }).closest(".gd-ui-kit-tooltip__anchor"),
        ).not.toBeNull();

        rerender(<UiToolbarIconButton icon="plus" label="Add" hideTooltip />);
        expect(screen.getByRole("button", { name: "Add" }).closest(".gd-ui-kit-tooltip__anchor")).toBeNull();
    });
});
