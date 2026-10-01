// (C) 2026 GoodData Corporation

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type IUiResizableSidebarState } from "./types.js";
import { UiResizableSidebar } from "./UiResizableSidebar.js";
import { UiResizableSidebarProvider } from "./UiResizableSidebarContext.js";
import { UiResizableSidebarHandle } from "./UiResizableSidebarHandle.js";

const baseState: IUiResizableSidebarState = {
    width: 300,
    expandedWidth: 300,
    min: 230,
    max: 500,
    canResize: true,
    setWidth: () => {},
    canCollapse: false,
    hasRail: false,
    isCollapsed: false,
    setCollapsed: () => {},
};

describe("UiResizableSidebar", () => {
    const renderSidebar = (state: Partial<IUiResizableSidebarState> = {}) => {
        const onWidthChange = vi.fn<(width: number) => void>();

        render(
            <UiResizableSidebar state={{ ...baseState, setWidth: onWidthChange, ...state }}>
                <div>
                    <span>Sidebar content</span>
                    <UiResizableSidebarHandle accessibilityConfig={{ ariaLabel: "Resize sidebar" }} />
                </div>
            </UiResizableSidebar>,
        );

        return {
            onWidthChange,
            handle: screen.getByRole("separator", { name: "Resize sidebar" }),
            sidebar: screen.getByText("Sidebar content").closest(".gd-ui-kit-resizable-sidebar")!,
        };
    };

    it("exposes the width and its bounds on the separator", () => {
        const { handle, sidebar } = renderSidebar();

        expect(handle).toHaveAttribute("aria-orientation", "vertical");
        expect(handle).toHaveAttribute("aria-valuenow", "300");
        expect(handle).toHaveAttribute("aria-valuemin", "230");
        expect(handle).toHaveAttribute("aria-valuemax", "500");
        expect(sidebar).toHaveStyle({ width: "300px" });
        expect(sidebar).toHaveClass("gd-ui-kit-resizable-sidebar--resizable");
    });

    it("disables the handle when the sidebar cannot be resized", () => {
        const { handle, onWidthChange, sidebar } = renderSidebar({ canResize: false });

        expect(handle).toBeDisabled();
        expect(sidebar).not.toHaveClass("gd-ui-kit-resizable-sidebar--resizable");

        fireEvent.pointerDown(handle, { clientX: 100, button: 0, isPrimary: true });
        fireEvent.pointerMove(handle, { clientX: 200, buttons: 1 });
        fireEvent.lostPointerCapture(handle);

        expect(onWidthChange).not.toHaveBeenCalled();
    });

    it("resizes by the keyboard step and jumps to the bounds", () => {
        const { handle, onWidthChange } = renderSidebar();

        fireEvent.keyDown(handle, { code: "ArrowRight" });
        fireEvent.keyDown(handle, { code: "ArrowLeft" });
        fireEvent.keyDown(handle, { code: "Home" });
        fireEvent.keyDown(handle, { code: "End" });

        expect(onWidthChange.mock.calls.map(([width]) => width)).toEqual([310, 290, 230, 500]);
    });

    it("clamps keyboard resizing to the bounds", () => {
        const { handle, onWidthChange } = renderSidebar({ width: 495 });

        fireEvent.keyDown(handle, { code: "ArrowRight" });

        expect(onWidthChange).toHaveBeenCalledExactlyOnceWith(500);
    });

    it("skips keyboard commits that would not change the width", () => {
        const { handle, onWidthChange } = renderSidebar({ width: 500 });

        fireEvent.keyDown(handle, { code: "ArrowRight" });
        fireEvent.keyDown(handle, { code: "End" });

        expect(onWidthChange).not.toHaveBeenCalled();
    });

    it.each([
        ["secondary button", { button: 2, isPrimary: true }],
        ["non-primary pointer", { button: 0, isPrimary: false }],
    ])("ignores a %s press", (_name, init) => {
        const { handle, onWidthChange, sidebar } = renderSidebar();

        fireEvent.pointerDown(handle, { clientX: 100, ...init });
        fireEvent.pointerMove(handle, { clientX: 150, buttons: 1 });

        expect(sidebar).not.toHaveClass("gd-ui-kit-resizable-sidebar--dragging");

        fireEvent.lostPointerCapture(handle);

        expect(onWidthChange).not.toHaveBeenCalled();
    });

    it("commits the dragged width only on pointer release", () => {
        const { handle, onWidthChange, sidebar } = renderSidebar();

        fireEvent.pointerDown(handle, { clientX: 100, button: 0, isPrimary: true });
        fireEvent.pointerMove(handle, { clientX: 150, buttons: 1 });

        expect(sidebar).toHaveClass("gd-ui-kit-resizable-sidebar--dragging");
        expect(sidebar).toHaveStyle({ width: "300px" });
        expect(onWidthChange).not.toHaveBeenCalled();

        fireEvent.lostPointerCapture(handle);

        expect(onWidthChange).toHaveBeenCalledExactlyOnceWith(350);
        expect(sidebar).not.toHaveClass("gd-ui-kit-resizable-sidebar--dragging");
    });

    it("clamps the dragged width to the bounds", () => {
        const { handle, onWidthChange } = renderSidebar();

        fireEvent.pointerDown(handle, { clientX: 100, button: 0, isPrimary: true });
        fireEvent.pointerMove(handle, { clientX: 900, buttons: 1 });
        fireEvent.lostPointerCapture(handle);

        fireEvent.pointerDown(handle, { clientX: 100, button: 0, isPrimary: true });
        fireEvent.pointerMove(handle, { clientX: -900, buttons: 1 });
        fireEvent.lostPointerCapture(handle);

        expect(onWidthChange.mock.calls.map(([width]) => width)).toEqual([500, 230]);
    });

    it("cancels the drag on Escape, releases the pointer and commits nothing", () => {
        const { handle, onWidthChange, sidebar } = renderSidebar();
        const release = vi.fn();
        Object.assign(handle, { hasPointerCapture: () => true, releasePointerCapture: release });

        fireEvent.pointerDown(handle, { clientX: 100, button: 0, isPrimary: true });
        fireEvent.pointerMove(handle, { clientX: 150, buttons: 1 });
        fireEvent.keyDown(document, { key: "Escape" });

        expect(sidebar).not.toHaveClass("gd-ui-kit-resizable-sidebar--dragging");
        expect(release).toHaveBeenCalledOnce();

        fireEvent.lostPointerCapture(handle);

        expect(onWidthChange).not.toHaveBeenCalled();
    });

    it("hides the sidebar completely when collapsed to zero width", () => {
        const { sidebar } = renderSidebar({ width: 0, min: 0, max: 0, canResize: false, isCollapsed: true });

        expect(sidebar).toHaveClass("gd-ui-kit-resizable-sidebar--collapsed");
        expect(sidebar).toHaveClass("gd-ui-kit-resizable-sidebar--hidden");
        expect(sidebar).toHaveAttribute("inert");
        expect(sidebar).toHaveStyle({ width: "0px" });
    });

    it("lifts inert again once the sidebar expands", () => {
        const hidden = { ...baseState, width: 0, min: 0, max: 0, canResize: false, isCollapsed: true };
        const { rerender } = render(
            <UiResizableSidebar state={hidden}>
                <span>Sidebar content</span>
            </UiResizableSidebar>,
        );
        const sidebar = screen.getByText("Sidebar content").closest(".gd-ui-kit-resizable-sidebar")!;

        expect(sidebar).toHaveAttribute("inert");

        rerender(
            <UiResizableSidebar state={{ ...baseState, width: 230, expandedWidth: 230 }}>
                <span>Sidebar content</span>
            </UiResizableSidebar>,
        );

        expect(sidebar).not.toHaveAttribute("inert");
        expect(sidebar).not.toHaveClass("gd-ui-kit-resizable-sidebar--hidden");
    });

    it("reads the state from the provider when no state prop is given", () => {
        render(
            <UiResizableSidebarProvider value={{ ...baseState, width: 420, expandedWidth: 420 }}>
                <UiResizableSidebar>
                    <span>Sidebar content</span>
                </UiResizableSidebar>
            </UiResizableSidebarProvider>,
        );

        expect(screen.getByText("Sidebar content").closest(".gd-ui-kit-resizable-sidebar")).toHaveStyle({
            width: "420px",
        });
    });

    it("throws without a state prop and without a provider", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() =>
            render(
                <UiResizableSidebar>
                    <span>Sidebar content</span>
                </UiResizableSidebar>,
            ),
        ).toThrow("`UiResizableSidebar` needs a `state` prop or a `UiResizableSidebarProvider` above it");
    });

    it("keeps a collapsed rail interactive", () => {
        const { sidebar } = renderSidebar({
            width: 48,
            min: 48,
            max: 48,
            canResize: false,
            isCollapsed: true,
        });

        expect(sidebar).toHaveClass("gd-ui-kit-resizable-sidebar--collapsed");
        expect(sidebar).not.toHaveClass("gd-ui-kit-resizable-sidebar--hidden");
        expect(sidebar).not.toHaveAttribute("inert");
    });

    it("throws when the handle is rendered outside the sidebar", () => {
        vi.spyOn(console, "error").mockImplementation(() => {});

        expect(() => render(<UiResizableSidebarHandle />)).toThrow(
            "`UiResizableSidebarHandle` must be rendered within `UiResizableSidebar`",
        );
    });
});
