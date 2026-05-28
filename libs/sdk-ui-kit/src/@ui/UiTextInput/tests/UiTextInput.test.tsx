// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UiTextInput } from "../UiTextInput.js";

describe("UiTextInput", () => {
    it("renders the supplied value in the input", () => {
        render(<UiTextInput value="hello" onChange={() => {}} dataTestId="input" />);
        expect((screen.getByTestId("input") as HTMLInputElement).value).toBe("hello");
    });

    it("calls onChange with the next value on every change", () => {
        const onChange = vi.fn();
        render(<UiTextInput value="" onChange={onChange} dataTestId="input" />);
        fireEvent.change(screen.getByTestId("input"), { target: { value: "jane" } });
        expect(onChange).toHaveBeenCalledWith("jane");
    });

    it("renders the label when provided", () => {
        render(<UiTextInput value="" onChange={() => {}} label="Search" />);
        expect(screen.getByText("Search")).toBeInTheDocument();
    });

    it("renders the placeholder on the input", () => {
        render(<UiTextInput value="" onChange={() => {}} placeholder="Type here" dataTestId="input" />);
        expect(screen.getByTestId("input")).toHaveAttribute("placeholder", "Type here");
    });

    it("uses the requested input type", () => {
        render(<UiTextInput type="search" value="" onChange={() => {}} dataTestId="input" />);
        expect(screen.getByTestId("input")).toHaveAttribute("type", "search");
    });

    it("disables the input when disabled is true", () => {
        render(<UiTextInput value="" onChange={() => {}} disabled dataTestId="input" />);
        expect(screen.getByTestId("input")).toBeDisabled();
    });

    it("renders iconAfter as a static span when no click handler is given", () => {
        const { container } = render(
            <UiTextInput value="x" onChange={() => {}} iconAfter="cross" dataTestId="input" />,
        );
        expect(container.querySelector(".gd-ui-kit-text-input__icon-after")).toBeInTheDocument();
        // Static iconAfter renders no button.
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders onIconAfter as a clickable button with its accessible name", () => {
        const onClick = vi.fn();
        render(
            <UiTextInput
                value="x"
                onChange={() => {}}
                onIconAfter={{ icon: "cross", onClick, ariaLabel: "Clear" }}
                dataTestId="input"
            />,
        );
        const button = screen.getByRole("button", { name: "Clear" });
        fireEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("prefers onIconAfter over a static iconAfter", () => {
        render(
            <UiTextInput
                value="x"
                onChange={() => {}}
                iconAfter="cross"
                onIconAfter={{ icon: "cross", onClick: () => {}, ariaLabel: "Clear search" }}
            />,
        );
        // Only the button form renders; the static icon does not duplicate it.
        expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
    });

    it("forwards accessibilityConfig.ariaLabel to the input", () => {
        render(
            <UiTextInput
                value=""
                onChange={() => {}}
                accessibilityConfig={{ ariaLabel: "Search users" }}
                dataTestId="input"
            />,
        );
        expect(screen.getByTestId("input")).toHaveAttribute("aria-label", "Search users");
    });
});
