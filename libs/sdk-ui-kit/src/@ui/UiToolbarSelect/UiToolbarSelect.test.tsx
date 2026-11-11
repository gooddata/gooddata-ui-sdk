// (C) 2026 GoodData Corporation

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { UiToolbarSelect } from "./UiToolbarSelect.js";

describe("UiToolbarSelect", () => {
    it("announces a closed listbox popup by default", async () => {
        const onClick = vi.fn();
        const { user } = render(<UiToolbarSelect label="Inter" onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Inter" });
        expect(button).toHaveAttribute("aria-haspopup", "listbox");
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveClass("gd-ui-kit-toolbar-select--width-hug");

        await user.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("marks the open state and flips the chevron", () => {
        render(<UiToolbarSelect label="Inter" isOpen />);

        const button = screen.getByRole("button", { name: "Inter" });
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(button).toHaveClass("gd-ui-kit-toolbar-select--isActive");
        expect(button.querySelector(".gd-ui-kit-toolbar-chevron--isOpen")).not.toBeNull();
    });

    it("exposes the full label of a fixed-width trigger through title", () => {
        render(<UiToolbarSelect label="A very long user generated name" width="fixed" />);

        const button = screen.getByRole("button", { name: "A very long user generated name" });
        expect(button).toHaveClass("gd-ui-kit-toolbar-select--width-fixed");
        expect(button).toHaveAttribute("title", "A very long user generated name");
    });

    it("applies the placeholder modifier", () => {
        render(<UiToolbarSelect label="Choose a font" isPlaceholder />);

        expect(screen.getByRole("button", { name: "Choose a font" })).toHaveClass(
            "gd-ui-kit-toolbar-select--isPlaceholder",
        );
    });

    it("lets dropdown aria attributes override the defaults", () => {
        render(
            <UiToolbarSelect
                label="Inter"
                ariaAttributes={{
                    role: "combobox",
                    "aria-haspopup": "menu",
                    "aria-expanded": true,
                    "aria-controls": "menu-id",
                }}
            />,
        );

        const trigger = screen.getByRole("combobox");
        expect(trigger).toHaveAttribute("aria-haspopup", "menu");
        expect(trigger).toHaveAttribute("aria-controls", "menu-id");
    });

    it("draws nothing but the label and the chevron without an icon", () => {
        render(<UiToolbarSelect label="Inter" />);

        const button = screen.getByRole("button", { name: "Inter" });
        expect(Array.from(button.children).map((child) => child.className)).toEqual([
            "gd-ui-kit-toolbar-select__label",
            "gd-ui-kit-toolbar-chevron",
        ]);
    });

    it("draws its icon before the label", () => {
        render(<UiToolbarSelect label="Heading 1" icon="heading1" />);

        const button = screen.getByRole("button", { name: "Heading 1" });
        expect(button.firstElementChild).toBe(screen.getByTestId("icon-heading1"));
        expect(button).toHaveAccessibleName("Heading 1");
    });

    it("sets no inline style for the fixed width", () => {
        render(<UiToolbarSelect label="Inter" width="fixed" />);

        expect(screen.getByRole("button", { name: "Inter" })).not.toHaveAttribute("style");
    });

    it("caps a hugging width and exposes the full label through title", () => {
        render(<UiToolbarSelect label="A very long user generated name" maxWidth={240} />);

        const button = screen.getByRole("button", { name: "A very long user generated name" });
        expect(button).toHaveClass("gd-ui-kit-toolbar-select--width-hug");
        expect(button).toHaveStyle({ maxWidth: "240px" });
        expect(button.style.width).toBe("");
        expect(button).toHaveAttribute("title", "A very long user generated name");
    });

    it("sets no inline style and no title for a hugging width without a cap", () => {
        render(<UiToolbarSelect label="Inter" />);

        const button = screen.getByRole("button", { name: "Inter" });
        expect(button).not.toHaveAttribute("style");
        expect(button).not.toHaveAttribute("title");
    });
});
