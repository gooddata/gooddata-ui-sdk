// (C) 2025-2026 GoodData Corporation

import { FloatingPortal } from "@floating-ui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAccessibilityConfigBase } from "../../../typings/accessibility.js";
import { type IUiPopoverProps, UiPopover } from "../UiPopover.js";

describe("UiPopover", () => {
    const renderPopover = (props: Partial<IUiPopoverProps> = {}) => {
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

    it("does not set aria-labelledby on a titleless popover", () => {
        renderPopover({ closeVisible: false });
        fireEvent.click(screen.getByText("Anchor"));
        const dialog = screen.getByRole("dialog");
        expect(dialog).not.toHaveAttribute("aria-labelledby");
    });

    it("points aria-labelledby at the rendered title when one is supplied", () => {
        renderPopover({ title: "My title", closeVisible: false });
        fireEvent.click(screen.getByText("Anchor"));
        const dialog = screen.getByRole("dialog");
        const labelledBy = dialog.getAttribute("aria-labelledby");
        expect(labelledBy).toBeTruthy();
        expect(document.getElementById(labelledBy!)).toHaveTextContent("My title");
    });

    it("lets a caller's aria-labelledby win over the auto-wired title id", () => {
        const ariaLabelledBy = "external-title-id";
        renderPopover({ title: "Internal", accessibilityConfig: { ariaLabelledBy } });
        fireEvent.click(screen.getByText("Anchor"));
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", ariaLabelledBy);
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

    describe("controlled open", () => {
        it("renders content from isOpen without an anchor click", () => {
            renderPopover({ isOpen: true });
            expect(screen.getByText("Popover content")).toBeInTheDocument();
        });

        it("keeps content hidden while isOpen is false, even on anchor click", () => {
            renderPopover({ isOpen: false });
            fireEvent.click(screen.getByText("Anchor"));
            expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
        });

        it("does not toggle closed on its own anchor click while controlled-open", () => {
            // Controlled mode suppresses the anchor's own click trigger so a
            // shared anchor (e.g. the permission-menu button) cannot flip the
            // labels popover; the parent owns the open state.
            renderPopover({ isOpen: true });
            fireEvent.mouseDown(screen.getByText("Anchor"));
            fireEvent.click(screen.getByText("Anchor"));
            expect(screen.getByText("Popover content")).toBeInTheDocument();
        });

        it("requests a close via onOpenChange on outside press", () => {
            const onOpenChange = vi.fn();
            const outside = document.createElement("button");
            outside.textContent = "outside";
            document.body.appendChild(outside);
            try {
                renderPopover({ isOpen: true, onOpenChange });
                fireEvent.click(outside);
                expect(onOpenChange).toHaveBeenCalledWith(false);
            } finally {
                outside.remove();
            }
        });
    });

    // Reproduces F1-2608: when a popover's anchor lives inside another
    // FloatingPortal (e.g. the OLP share dialog, a modal that portals its body),
    // floating-ui's React-tree-based dismiss treated every click in that tree as
    // "inside" and never closed. The DOM-based outside-click hook keys off real
    // DOM containment instead, so an outside click still closes it.
    describe("inside a parent floating portal (modal)", () => {
        it("closes on outside click when anchor is portalled", () => {
            const onClose = vi.fn();
            const outside = document.createElement("button");
            outside.textContent = "outside";
            document.body.appendChild(outside);
            try {
                render(
                    <FloatingPortal>
                        <UiPopover
                            anchor={<div tabIndex={0}>Anchor</div>}
                            content={() => <div>Popover content</div>}
                            onClose={onClose}
                        />
                    </FloatingPortal>,
                );
                fireEvent.click(screen.getByText("Anchor"));
                expect(screen.getByText("Popover content")).toBeInTheDocument();

                fireEvent.click(outside);
                expect(onClose).toHaveBeenCalled();
                expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
            } finally {
                outside.remove();
            }
        });
    });
});
