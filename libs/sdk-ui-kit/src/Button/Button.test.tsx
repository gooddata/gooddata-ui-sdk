// (C) 2007-2026 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button.js";
import { type IButtonProps } from "./typings.js";

function renderButton(options: Partial<IButtonProps>) {
    return render(<Button {...options} />);
}

describe("ReactButton", () => {
    describe("click on button", () => {
        it("should call onClick callback on click", async () => {
            const onClick = vi.fn();
            renderButton({
                type: "primary" as "button" | "submit" | "reset",
                disabled: false,
                onClick,
            });

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(onClick).toHaveBeenCalledTimes(1);
            });
        });

        it("should not call onClick callback on click when disabled", async () => {
            const onClick = vi.fn();
            renderButton({
                type: "primary" as "button" | "submit" | "reset",
                disabled: true,
                onClick,
            });

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(onClick).not.toHaveBeenCalled();
            });
        });
    });

    describe("render as link", () => {
        it("should be possible to render as anchor", () => {
            renderButton({
                type: "link" as "button" | "submit" | "reset",
                tagName: "a",
                value: "My link",
            });

            expect(document.querySelector("a")).toBeInTheDocument();
        });

        it("should be rendered as HTML button by default", () => {
            renderButton({
                type: "link" as "button" | "submit" | "reset",
                value: "My link",
            });

            expect(screen.getByRole("button")).toBeInTheDocument();
        });
    });

    describe("render button value", () => {
        it("should render simple text value", () => {
            const BUTTON_TEXT = "text value";
            renderButton({
                value: BUTTON_TEXT,
            });

            expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument();
        });

        it("should render icon in button", () => {
            renderButton({
                value: "text value",
                iconLeft: "gd-icon-class",
            });

            expect(screen.getByTestId("gd-button-icon")).toBeInTheDocument();
        });
    });

    describe("dropdown aria attributes", () => {
        it("should derive aria-expanded and aria-controls from isExpanded and popupId", () => {
            renderButton({ accessibilityConfig: { isExpanded: true, popupId: "popup" } });

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-expanded", "true");
            expect(button).toHaveAttribute("aria-controls", "popup");
            expect(button).toHaveAttribute("aria-haspopup", "true");
        });

        it("should not render aria-controls when collapsed", () => {
            renderButton({ accessibilityConfig: { isExpanded: false, popupId: "popup" } });

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-expanded", "false");
            expect(button).not.toHaveAttribute("aria-controls");
        });

        it("should let explicit ariaExpanded and ariaControls override the derived values", () => {
            renderButton({
                accessibilityConfig: {
                    isExpanded: true,
                    popupId: "popup",
                    ariaExpanded: false,
                    ariaControls: "other",
                },
            });

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-expanded", "false");
            expect(button).toHaveAttribute("aria-controls", "other");
        });

        it("should derive aria-controls when ariaExpanded is explicit but ariaControls is not", () => {
            // the shape Dropdown's renderButton and DropdownButton pass while open
            renderButton({
                accessibilityConfig: {
                    isExpanded: true,
                    popupId: "popup",
                    ariaExpanded: true,
                    ariaControls: undefined,
                },
            });

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-expanded", "true");
            expect(button).toHaveAttribute("aria-controls", "popup");
        });

        it("should render explicit ariaExpanded and ariaControls without isExpanded", () => {
            renderButton({ accessibilityConfig: { ariaExpanded: true, ariaControls: "description" } });

            const button = screen.getByRole("button");
            expect(button).toHaveAttribute("aria-expanded", "true");
            expect(button).toHaveAttribute("aria-controls", "description");
        });
    });
});
