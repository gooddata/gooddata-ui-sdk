// (C) 2007-2025 GoodData Corporation
import React from "react";
import { waitFor, render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button.js";
import { IButtonProps } from "../typings.js";
import { describe, it, expect, vi } from "vitest";

function renderButton(options: Partial<IButtonProps>) {
    return render(<Button {...options} />);
}

describe("ReactButton", () => {
    describe("click on button", () => {
        it("should call onClick callback on click", async () => {
            const onClick = vi.fn();
            renderButton({
                type: "primary",
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
                type: "primary",
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
        it("it should be possible to render as anchor", () => {
            renderButton({
                type: "link",
                tagName: "a",
                value: "My link",
            });

            expect(document.querySelector("a")).toBeInTheDocument();
        });

        it("it should be rendered as HTML button by default", () => {
            renderButton({
                type: "link",
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
});
