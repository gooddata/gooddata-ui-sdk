// (C) 2026 GoodData Corporation

import { createRef } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UiControlButton } from "../UiControlButton.js";

describe("UiControlButton", () => {
    it("renders the title", () => {
        render(<UiControlButton title="Threshold" />);
        expect(screen.getByText("Threshold")).toBeInTheDocument();
    });

    it("renders the subtitle when provided", () => {
        render(<UiControlButton title="Threshold" subtitle="Value: 25" />);
        expect(screen.getByText("Value: 25")).toBeInTheDocument();
    });

    it("renders the icon slot", () => {
        render(<UiControlButton title="T" icon={<span data-testid="icon" />} />);
        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("renders the titleExtension and subtitleExtension slots", () => {
        render(
            <UiControlButton
                title="T"
                titleExtension={<span data-testid="title-ext" />}
                subtitleExtension={<span data-testid="subtitle-ext" />}
            />,
        );
        expect(screen.getByTestId("title-ext")).toBeInTheDocument();
        expect(screen.getByTestId("subtitle-ext")).toBeInTheDocument();
    });

    it("exposes the dialog button ARIA contract", () => {
        render(<UiControlButton title="T" isOpen buttonId="btn-id" dropdownId="drop-id" disabled />);
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-haspopup", "dialog");
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(button).toHaveAttribute("aria-controls", "drop-id");
        expect(button).toHaveAttribute("aria-disabled", "true");
        expect(button).toHaveAttribute("id", "btn-id");
    });

    it("omits aria-controls when not open", () => {
        render(<UiControlButton title="T" dropdownId="drop-id" />);
        expect(screen.getByRole("button")).not.toHaveAttribute("aria-controls");
    });

    it("calls onClick when clicked", () => {
        const onClick = vi.fn();
        render(<UiControlButton title="T" onClick={onClick} />);
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("forwards data-testid to the button element", () => {
        render(<UiControlButton title="T" data-testid="custom-id" />);
        expect(screen.getByTestId("custom-id")).toBeInTheDocument();
    });

    it("toggles BEM modifiers for visual states", () => {
        const { rerender } = render(<UiControlButton title="T" />);
        const button = screen.getByRole("button");
        expect(button.className).not.toMatch(/--isOpen|--disabled|--isDraggable|--isError/);

        rerender(<UiControlButton title="T" isOpen isDraggable isError disabled />);
        expect(button.className).toMatch(/gd-ui-kit-control-button--isOpen/);
        expect(button.className).toMatch(/gd-ui-kit-control-button--disabled/);
        expect(button.className).toMatch(/gd-ui-kit-control-button--isDraggable/);
        expect(button.className).toMatch(/gd-ui-kit-control-button--isError/);
    });

    it("activates onClick on Enter and Space when not disabled", () => {
        const onClick = vi.fn();
        render(<UiControlButton title="T" onClick={onClick} />);
        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: "Enter" });
        fireEvent.keyDown(button, { key: " " });
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it("does not activate onClick on Enter/Space when disabled", () => {
        const onClick = vi.fn();
        render(<UiControlButton title="T" disabled onClick={onClick} />);
        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: "Enter" });
        fireEvent.keyDown(button, { key: " " });
        fireEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("stops Enter/Space propagation so wrappers do not toggle a second time", () => {
        const wrapperKeyDown = vi.fn();
        render(
            <div onKeyDown={wrapperKeyDown}>
                <UiControlButton title="T" onClick={vi.fn()} />
            </div>,
        );
        const button = screen.getByRole("button");
        fireEvent.keyDown(button, { key: "Enter" });
        fireEvent.keyDown(button, { key: " " });
        expect(wrapperKeyDown).not.toHaveBeenCalled();
    });

    it("wires disabledTooltip via UiTooltip and aria-describedby when disabled", () => {
        render(<UiControlButton title="T" disabled disabledTooltip="No can do" />);
        const button = screen.getByRole("button");
        const describedBy = button.getAttribute("aria-describedby");
        expect(describedBy).toBeTruthy();
    });

    it("does not wire disabledTooltip when not disabled", () => {
        render(<UiControlButton title="T" disabledTooltip="No can do" />);
        expect(screen.getByRole("button")).not.toHaveAttribute("aria-describedby");
    });

    it("forwards buttonRef to the underlying element", () => {
        const ref = createRef<HTMLDivElement>();
        render(<UiControlButton title="T" buttonRef={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("applies the className prop alongside BEM block", () => {
        render(<UiControlButton title="T" className="custom-cls" />);
        const button = screen.getByRole("button");
        expect(button.className).toMatch(/gd-ui-kit-control-button/);
        expect(button.className).toMatch(/custom-cls/);
    });

    it("applies titleClassName onto the title's ShortenedText element", () => {
        const { container } = render(<UiControlButton title="T" titleClassName="my-title-cls" />);
        expect(container.querySelector(".my-title-cls")).not.toBeNull();
    });
});
