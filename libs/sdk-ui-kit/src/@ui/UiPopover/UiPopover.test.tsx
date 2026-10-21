// (C) 2025-2026 GoodData Corporation

import { FloatingPortal } from "@floating-ui/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";

import { type IUiPopoverProps, UiPopover } from "./UiPopover.js";

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

    describe("Escape inside a parent that closes on Escape", () => {
        const renderInParent = (onParentEscape: () => void) =>
            render(
                <div
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            event.stopPropagation();
                            onParentEscape();
                        }
                    }}
                >
                    <UiPopover
                        anchor={<button type="button">Anchor</button>}
                        content={() => <button type="button">Inside</button>}
                    />
                </div>,
            );

        it("closes only the popover and returns focus to the anchor", async () => {
            const onParentEscape = vi.fn();
            renderInParent(onParentEscape);
            fireEvent.click(screen.getByText("Anchor"));

            fireEvent.keyDown(screen.getByText("Inside"), { key: "Escape" });

            expect(screen.queryByText("Inside")).not.toBeInTheDocument();
            expect(onParentEscape).not.toHaveBeenCalled();
            await waitFor(() => expect(screen.getByText("Anchor")).toHaveFocus());
        });

        it("keeps the popover and the parent open when the content handles Escape itself", () => {
            const onParentEscape = vi.fn();
            render(
                <div
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            onParentEscape();
                        }
                    }}
                >
                    <UiPopover
                        anchor={<button type="button">Anchor</button>}
                        content={() => (
                            <button
                                type="button"
                                onKeyDown={(event) => {
                                    if (event.key === "Escape") {
                                        event.preventDefault();
                                    }
                                }}
                            >
                                Inside
                            </button>
                        )}
                    />
                </div>,
            );
            fireEvent.click(screen.getByText("Anchor"));

            fireEvent.keyDown(screen.getByText("Inside"), { key: "Escape" });

            expect(screen.getByText("Inside")).toBeInTheDocument();
            expect(onParentEscape).not.toHaveBeenCalled();
        });

        it("keeps the popover and the parent open on Escape during IME composition", () => {
            const onParentEscape = vi.fn();
            renderInParent(onParentEscape);
            fireEvent.click(screen.getByText("Anchor"));

            fireEvent.keyDown(screen.getByText("Inside"), { key: "Escape", isComposing: true });

            expect(screen.getByText("Inside")).toBeInTheDocument();
            expect(onParentEscape).not.toHaveBeenCalled();
        });

        it("lets the parent handle Escape once the popover is closed", () => {
            const onParentEscape = vi.fn();
            renderInParent(onParentEscape);

            fireEvent.keyDown(screen.getByText("Anchor"), { key: "Escape" });

            expect(onParentEscape).toHaveBeenCalledTimes(1);
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
