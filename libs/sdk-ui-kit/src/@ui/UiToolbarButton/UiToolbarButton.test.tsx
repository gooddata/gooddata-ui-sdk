// (C) 2026 GoodData Corporation

import { createRef } from "react";

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { render } from "../../../test/render.js";

import { UiToolbarButton } from "./UiToolbarButton.js";

describe("UiToolbarButton", () => {
    it("renders a plain button with the label", async () => {
        const onClick = vi.fn();
        const ref = createRef<HTMLButtonElement>();
        const { user } = render(<UiToolbarButton ref={ref} label="Reset" onClick={onClick} />);

        const button = screen.getByRole("button", { name: "Reset" });
        expect(button).toHaveAttribute("type", "button");
        expect(button).not.toHaveAttribute("aria-pressed");
        expect(button).not.toHaveAttribute("tabindex");
        expect(button).toHaveAttribute("data-testid", "reset");
        expect(ref.current).toBe(button);

        await user.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("exposes isSelected as aria-pressed and as a modifier", () => {
        render(<UiToolbarButton label="Bold" isSelected />);

        const button = screen.getByRole("button", { name: "Bold" });
        expect(button).toHaveAttribute("aria-pressed", "true");
        expect(button).toHaveClass("gd-ui-kit-toolbar-button--isSelected");
    });

    it("applies destructive and active modifiers", () => {
        render(<UiToolbarButton label="Delete" isDestructive isActive />);

        const button = screen.getByRole("button", { name: "Delete" });
        expect(button).toHaveClass("gd-ui-kit-toolbar-button--isDestructive");
        expect(button).toHaveClass("gd-ui-kit-toolbar-button--isActive");
    });

    it("uses aria-disabled and ignores clicks and key handlers when disabled", async () => {
        const onClick = vi.fn();
        const onKeyDown = vi.fn();
        const { user } = render(
            <UiToolbarButton label="Reset" isDisabled onClick={onClick} onKeyDown={onKeyDown} />,
        );

        const button = screen.getByRole("button", { name: "Reset" });
        expect(button).toHaveAttribute("aria-disabled", "true");
        expect(button).not.toBeDisabled();

        await user.click(button);
        button.focus();
        await user.keyboard("{Enter}");
        expect(onClick).not.toHaveBeenCalled();
        expect(onKeyDown).not.toHaveBeenCalled();
    });

    it("keeps activation keys of a disabled item away from an enclosing dropdown wrapper", async () => {
        const wrapperKeyDown = vi.fn();
        const { user } = render(
            <div onKeyDown={wrapperKeyDown}>
                <UiToolbarButton label="Open" isDisabled />
            </div>,
        );

        screen.getByRole("button", { name: "Open" }).focus();
        await user.keyboard("{Enter} {ArrowDown}{ArrowUp}");
        expect(wrapperKeyDown).not.toHaveBeenCalled();

        await user.keyboard("{ArrowRight}");
        expect(wrapperKeyDown).toHaveBeenCalledTimes(1);
    });

    it("spreads dropdown aria attributes last", () => {
        render(
            <UiToolbarButton
                label="Font"
                ariaAttributes={{ role: "button", "aria-haspopup": "listbox", "aria-expanded": true }}
            />,
        );

        const button = screen.getByRole("button", { name: "Font" });
        expect(button).toHaveAttribute("aria-haspopup", "listbox");
        expect(button).toHaveAttribute("aria-expanded", "true");
    });
});
