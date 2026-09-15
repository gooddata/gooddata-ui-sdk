// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render } from "../../../test/render.js";

import { UiToolbarIconSelect } from "./UiToolbarIconSelect.js";

describe("UiToolbarIconSelect", () => {
    it("announces a listbox popup and renders the default swatch", () => {
        render(<UiToolbarIconSelect label="Fill colour" />);

        const button = screen.getByRole("button", { name: "Fill colour" });
        expect(button).toHaveAttribute("aria-haspopup", "listbox");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).not.toHaveAttribute("aria-pressed");
        expect(button.querySelector(".gd-ui-kit-toolbar-color-swatch")).not.toBeNull();
    });

    it("exposes isSelected as aria-pressed and flips the chevron when open", () => {
        render(<UiToolbarIconSelect label="Fill colour" isSelected isOpen popupType="menu" />);

        const button = screen.getByRole("button", { name: "Fill colour" });
        expect(button).toHaveAttribute("aria-pressed", "true");
        expect(button).toHaveAttribute("aria-haspopup", "menu");
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(button).toHaveClass("gd-ui-kit-toolbar-icon-select--isSelected");
        expect(button.querySelector(".gd-ui-kit-toolbar-chevron--isOpen")).not.toBeNull();
    });
});
