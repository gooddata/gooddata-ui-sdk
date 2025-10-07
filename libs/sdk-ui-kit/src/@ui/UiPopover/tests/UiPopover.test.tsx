// (C) 2025 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { IAccessibilityConfigBase } from "../../../typings/accessibility.js";
import { UiPopover, UiPopoverProps } from "../UiPopover.js";

describe("UiPopover", () => {
    const renderPopover = (props: Partial<UiPopoverProps> = {}) => {
        const defaultAriaAttributes: IAccessibilityConfigBase = {};

        return render(
            <UiPopover
                anchor={<div tabIndex={0}>Anchor</div>}
                accessibilityConfig={defaultAriaAttributes}
                content={() => <div>Popover content</div>}
                footer={() => <div>Popover footer</div>}
                closeVisible
                {...props}
            />,
        );
    };

    it("should render simple popover", () => {
        renderPopover();

        expect(screen.getByText("Anchor")).toBeInTheDocument();
        expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
        expect(screen.queryByText("Popover footer")).not.toBeInTheDocument();
    });

    it("should render simple popover, open content on click", () => {
        renderPopover();

        expect(screen.getByText("Anchor")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Anchor"));
        expect(screen.getByText("Popover content")).toBeInTheDocument();
        expect(screen.getByText("Popover footer")).toBeInTheDocument();

        fireEvent.mouseDown(screen.getByText("Anchor"));
        fireEvent.click(screen.getByText("Anchor"));

        expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
        expect(screen.queryByText("Popover footer")).not.toBeInTheDocument();
    });

    it("should render simple popover, open content on click, tests events", () => {
        const onOpen = vi.fn();
        const onClose = vi.fn();

        renderPopover({
            onOpen,
            onClose,
        });

        expect(onOpen).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByText("Anchor")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Anchor"));

        expect(onOpen).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.mouseDown(screen.getByText("Anchor"));
        fireEvent.click(screen.getByText("Anchor"));

        expect(onOpen).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});
