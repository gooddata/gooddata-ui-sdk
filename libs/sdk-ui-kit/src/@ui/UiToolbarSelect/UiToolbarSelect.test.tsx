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
});
