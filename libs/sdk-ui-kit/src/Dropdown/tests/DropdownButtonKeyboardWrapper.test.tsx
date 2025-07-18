// (C) 2025 GoodData Corporation
import { createRef } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DropdownButtonKeyboardWrapper } from "../DropdownButtonKeyboardWrapper.js";

describe("DropdownButtonKeyboardWrapper", () => {
    const renderWrapper = (props = {}) => {
        const defaultProps = {
            onToggle: vi.fn(),
            isOpen: false,
        };

        return render(
            <DropdownButtonKeyboardWrapper {...defaultProps} {...props} data-testid="wrapper">
                <button>Toggle Dropdown</button>
            </DropdownButtonKeyboardWrapper>,
        );
    };

    it("should render children correctly", () => {
        renderWrapper();
        expect(screen.getByText("Toggle Dropdown")).toBeInTheDocument();
    });

    it("should call onToggle when Enter key is pressed", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "Enter" });

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("should call onToggle when Space key is pressed and input is not focused", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "Space" });

        expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("should not call onToggle when Space key is pressed and input is focused", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle });

        // Mock document.activeElement to be an input
        Object.defineProperty(document, "activeElement", {
            get: () => document.createElement("input"),
            configurable: true,
        });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "Space" });

        expect(onToggle).not.toHaveBeenCalled();
    });

    it("should call onToggle with false when Escape key is pressed and dropdown is open", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle, isOpen: true });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "Escape" });

        expect(onToggle).toHaveBeenCalledWith(false);
    });

    it("should call onToggle with false when ArrowUp key is pressed and dropdown is open", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle, isOpen: true });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "ArrowUp" });

        expect(onToggle).toHaveBeenCalledWith(false);
    });

    it("should call onToggle with true when ArrowDown key is pressed and dropdown is closed", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle, isOpen: false });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "ArrowDown" });

        expect(onToggle).toHaveBeenCalledWith(true);
    });

    it("should not call onToggle when Escape or ArrowUp key is pressed and dropdown is closed", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle, isOpen: false });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "Escape" });
        fireEvent.keyDown(button, { code: "ArrowUp" });

        expect(onToggle).not.toHaveBeenCalled();
    });

    it("should not call onToggle when ArrowDown key is pressed and dropdown is open", () => {
        const onToggle = vi.fn();
        renderWrapper({ onToggle, isOpen: true });

        const button = screen.getByText("Toggle Dropdown");
        fireEvent.keyDown(button, { code: "ArrowDown" });

        expect(onToggle).not.toHaveBeenCalled();
    });

    it("should forward ref to the div element", () => {
        const ref = createRef<HTMLElement>();
        render(
            <DropdownButtonKeyboardWrapper onToggle={vi.fn()} isOpen={false} ref={ref}>
                <button>Toggle Dropdown</button>
            </DropdownButtonKeyboardWrapper>,
        );

        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName).toBe("DIV");
    });

    it("should pass additional props to the div element", () => {
        renderWrapper({ className: "custom-class", "aria-label": "Dropdown button" });

        const wrapper = screen.getByTestId("wrapper");
        expect(wrapper).toHaveClass("custom-class");
        expect(wrapper).toHaveAttribute("aria-label", "Dropdown button");
    });
});
