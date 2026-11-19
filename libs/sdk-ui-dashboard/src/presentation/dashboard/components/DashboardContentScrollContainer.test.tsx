// (C) 2026 GoodData Corporation

import { useRef } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardContentScrollContainer } from "./DashboardContentScrollContainer.js";

let canvasWidth: number;
let contentWidth: number;
let resizeCallback: ResizeObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

function TestContent({
    isEditMode = true,
    onScrollGeometryChange,
}: {
    isEditMode?: boolean;
    onScrollGeometryChange?: (width: number, scrollLeft: number) => void;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    return (
        <IntlProvider
            locale="en-US"
            messages={{ "dashboard.content.horizontalScroll": "Scroll dashboard content horizontally" }}
        >
            <DashboardContentScrollContainer
                contentRef={contentRef}
                isEditMode={isEditMode}
                onScrollGeometryChange={onScrollGeometryChange}
            >
                <div ref={contentRef}>Dashboard content</div>
            </DashboardContentScrollContainer>
        </IntlProvider>
    );
}

function resize() {
    act(() => resizeCallback([], {} as ResizeObserver));
}

describe("DashboardContentScrollContainer", () => {
    beforeEach(() => {
        canvasWidth = 470;
        contentWidth = 940;
        vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => canvasWidth);
        vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => contentWidth);
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
            () => ({ width: contentWidth }) as DOMRect,
        );
        vi.stubGlobal(
            "ResizeObserver",
            class {
                observe = observe;
                disconnect = disconnect;
                constructor(callback: ResizeObserverCallback) {
                    resizeCallback = callback;
                }
            },
        );
    });

    it("shows a keyboard-focusable scrollbar sized to the overflowing content", () => {
        render(<TestContent />);

        const scrollbar = screen.getByRole("scrollbar", { name: "Scroll dashboard content horizontally" });
        expect(scrollbar).toHaveAttribute("tabindex", "0");
        expect(scrollbar).toHaveAttribute("aria-orientation", "horizontal");
        expect(scrollbar.firstElementChild).toHaveStyle({ width: "940px" });
        expect(observe).toHaveBeenCalledTimes(2);
    });

    it("links the scrollbar to the canvas and exposes the scroll position", () => {
        const { container } = render(<TestContent />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        const scrollbar = screen.getByRole("scrollbar");

        expect(canvas.id).not.toBe("");
        expect(scrollbar).toHaveAttribute("aria-controls", canvas.id);
        expect(scrollbar).toHaveAttribute("aria-valuenow", "0");

        fireEvent.scroll(scrollbar, { target: { scrollLeft: 235 } });
        expect(scrollbar).toHaveAttribute("aria-valuenow", "50");

        fireEvent.scroll(canvas, { target: { scrollLeft: 470 } });
        expect(scrollbar).toHaveAttribute("aria-valuenow", "100");
    });

    it("makes the canvas a scroll container only while its content overflows", () => {
        const { container, rerender } = render(<TestContent />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        expect(canvas).toHaveClass("gd-dash-content-scroll-container--scrollable");

        canvasWidth = 1200;
        resize();
        expect(canvas).not.toHaveClass("gd-dash-content-scroll-container--scrollable");

        canvasWidth = 470;
        resize();
        expect(canvas).toHaveClass("gd-dash-content-scroll-container--scrollable");

        rerender(<TestContent isEditMode={false} />);
        expect(canvas).not.toHaveClass("gd-dash-content-scroll-container--scrollable");
    });

    it("synchronizes the scrollbar and canvas in both directions", () => {
        const { container } = render(<TestContent />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        const scrollbar = screen.getByRole("scrollbar");

        fireEvent.scroll(scrollbar, { target: { scrollLeft: 200 } });
        expect(canvas.scrollLeft).toBe(200);

        fireEvent.scroll(canvas, { target: { scrollLeft: 100 } });
        expect(scrollbar.scrollLeft).toBe(100);
    });

    it("does not write back a synchronized scroll event", () => {
        const { container } = render(<TestContent />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        const scrollbar = screen.getByRole("scrollbar");
        fireEvent.scroll(scrollbar, { target: { scrollLeft: 200 } });

        const setScrollLeft = vi.spyOn(scrollbar, "scrollLeft", "set");
        fireEvent.scroll(canvas);
        expect(setScrollLeft).not.toHaveBeenCalled();
    });

    it("hides the scrollbar when the canvas fits and updates it when either width changes", () => {
        render(<TestContent />);
        canvasWidth = 1200;
        resize();
        expect(screen.queryByRole("scrollbar")).toBeNull();

        contentWidth = 1400;
        resize();
        expect(screen.getByRole("scrollbar").firstElementChild).toHaveStyle({ width: "1400px" });

        canvasWidth = 1500;
        resize();
        expect(screen.queryByRole("scrollbar")).toBeNull();
    });

    it("keeps the scrollbar aligned with the canvas after resizing", () => {
        const { container } = render(<TestContent />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        canvas.scrollLeft = 100;
        contentWidth = 1000;
        resize();

        expect(screen.getByRole("scrollbar").scrollLeft).toBe(100);
    });

    it("reports canvas geometry on mount, either scroll source, and resize", () => {
        const onScrollGeometryChange = vi.fn();
        const { container } = render(<TestContent onScrollGeometryChange={onScrollGeometryChange} />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        const scrollbar = screen.getByRole("scrollbar");

        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(940, 0);

        fireEvent.scroll(canvas, { target: { scrollLeft: 100 } });
        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(940, 100);

        fireEvent.scroll(scrollbar, { target: { scrollLeft: 200 } });
        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(940, 200);

        contentWidth = 1000;
        resize();
        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(1000, 200);

        canvasWidth = 1200;
        contentWidth = 1200;
        canvas.scrollLeft = 0;
        resize();
        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(1200, 0);
    });

    it("reports a synchronized scroll once and reads layout only on resize", () => {
        const onScrollGeometryChange = vi.fn();
        const { container } = render(<TestContent onScrollGeometryChange={onScrollGeometryChange} />);
        const canvas = container.querySelector(".gd-dash-content-scroll-container") as HTMLDivElement;
        const scrollbar = screen.getByRole("scrollbar");
        onScrollGeometryChange.mockClear();
        vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockClear();

        fireEvent.scroll(scrollbar, { target: { scrollLeft: 200 } });
        fireEvent.scroll(canvas);

        expect(onScrollGeometryChange).toHaveBeenCalledOnce();
        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(940, 200);
        expect(HTMLElement.prototype.getBoundingClientRect).not.toHaveBeenCalled();
    });

    it("reports geometry again after re-entering edit mode", () => {
        const onScrollGeometryChange = vi.fn();
        const { rerender } = render(<TestContent onScrollGeometryChange={onScrollGeometryChange} />);
        rerender(<TestContent isEditMode={false} onScrollGeometryChange={onScrollGeometryChange} />);
        onScrollGeometryChange.mockClear();

        rerender(<TestContent onScrollGeometryChange={onScrollGeometryChange} />);
        expect(onScrollGeometryChange).toHaveBeenCalledWith(940, 0);
    });

    it("does not report canvas geometry in view mode", () => {
        const onScrollGeometryChange = vi.fn();
        const { rerender } = render(
            <TestContent isEditMode={false} onScrollGeometryChange={onScrollGeometryChange} />,
        );
        expect(onScrollGeometryChange).not.toHaveBeenCalled();

        rerender(<TestContent onScrollGeometryChange={onScrollGeometryChange} />);
        expect(onScrollGeometryChange).toHaveBeenLastCalledWith(940, 0);
    });

    it("only observes sizes and shows the scrollbar in edit mode", () => {
        const { rerender } = render(<TestContent isEditMode={false} />);
        expect(screen.queryByRole("scrollbar")).toBeNull();
        expect(observe).not.toHaveBeenCalled();

        rerender(<TestContent />);
        expect(screen.getByRole("scrollbar")).toBeVisible();

        rerender(<TestContent isEditMode={false} />);
        expect(screen.queryByRole("scrollbar")).toBeNull();
        expect(disconnect).toHaveBeenCalledOnce();
    });

    it("disconnects size observation on unmount", () => {
        const { unmount } = render(<TestContent />);
        unmount();
        expect(disconnect).toHaveBeenCalledOnce();
    });
});
