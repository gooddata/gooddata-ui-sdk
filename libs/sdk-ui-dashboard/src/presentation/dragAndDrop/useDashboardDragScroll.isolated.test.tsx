// (C) 2026 GoodData Corporation

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type DraggableItemType } from "./types.js";
import { useDashboardDragScroll } from "./useDashboardDragScroll.js";

const { monitor } = vi.hoisted(() => ({
    monitor: {
        subscribeToOffsetChange: vi.fn(),
        getItemType: vi.fn(),
        getSourceClientOffset: vi.fn(),
        getInitialClientOffset: vi.fn(),
        getInitialSourceClientOffset: vi.fn(),
    },
}));

vi.mock("@evil-internetmann/react-dnd", () => {
    const manager = { getMonitor: () => monitor };
    return { useDragDropManager: () => manager };
});

describe("useDashboardDragScroll", () => {
    let verticalScroller: HTMLDivElement;
    let canvas: HTMLDivElement;
    let content: HTMLDivElement;
    let header: HTMLDivElement;
    let footer: HTMLDivElement;
    let offsetChanged: () => void;
    let rerender: (props: { enableCanvasScroll?: boolean }) => void;

    beforeEach(() => {
        vi.useFakeTimers();
        verticalScroller = document.createElement("div");
        canvas = document.createElement("div");
        content = document.createElement("div");
        header = document.createElement("div");
        footer = document.createElement("div");
        document.body.append(verticalScroller);
        verticalScroller.append(header, canvas, footer);
        canvas.append(content);
        canvas.style.overflowX = "auto";
        canvas.style.overflowY = "hidden";
        content.style.overflowY = "visible";
        verticalScroller.style.overflowY = "auto";
        Object.defineProperties(canvas, {
            clientWidth: { value: 770 },
            scrollWidth: { value: 1170 },
        });
        Object.defineProperties(verticalScroller, {
            clientHeight: { value: 800 },
            scrollHeight: { value: 2000 },
        });
        vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(new DOMRect(230, 200, 770, 1600));
        vi.spyOn(content, "getBoundingClientRect").mockReturnValue(new DOMRect(230, 200, 1170, 1600));
        vi.spyOn(header, "getBoundingClientRect").mockReturnValue(new DOMRect(230, 0, 770, 200));
        vi.spyOn(footer, "getBoundingClientRect").mockReturnValue(new DOMRect(230, 799, 770, 1));
        vi.spyOn(canvas, "scrollBy");
        vi.spyOn(verticalScroller, "scrollBy");
        monitor.subscribeToOffsetChange.mockImplementation((callback: () => void) => {
            offsetChanged = callback;
            return vi.fn();
        });
        monitor.getInitialClientOffset.mockReturnValue({ x: 500, y: 400 });
        monitor.getInitialSourceClientOffset.mockReturnValue({ x: 490, y: 390 });
        const contentRef = { current: content };
        const headerRef = { current: header };
        const footerRef = { current: footer };
        ({ rerender } = renderHook(
            ({ enableCanvasScroll }: { enableCanvasScroll?: boolean }) =>
                useDashboardDragScroll(contentRef, headerRef, footerRef, enableCanvasScroll),
            { initialProps: { enableCanvasScroll: true } as { enableCanvasScroll?: boolean } },
        ));
    });

    afterEach(() => {
        verticalScroller.remove();
        vi.useRealTimers();
    });

    function drag(type: DraggableItemType | null, x: number, y = 400) {
        monitor.getItemType.mockReturnValue(type);
        monitor.getSourceClientOffset.mockReturnValue(type ? { x: x - 10, y: y - 10 } : null);
        act(() => offsetChanged());
        act(() => vi.advanceTimersByTime(5));
    }

    it("scrolls only the canvas right when resizing near its visible right edge", () => {
        drag("internal-width-resizer", 980);
        expect(canvas.scrollBy).toHaveBeenCalledWith({ left: 3 });
        expect(verticalScroller.scrollBy).not.toHaveBeenCalled();
    });

    it("scrolls left using the canvas viewport, not the shifted content bounds", () => {
        canvas.scrollLeft = 200;
        vi.spyOn(content, "getBoundingClientRect").mockReturnValue(new DOMRect(30, 200, 1170, 1600));
        drag("internal-width-resizer", 250);
        expect(canvas.scrollBy).toHaveBeenCalledWith({ left: -3 });
    });

    it("stops scrolling when the pointer leaves the edge or the drag ends", () => {
        drag("internal-width-resizer", 980);
        vi.mocked(canvas.scrollBy).mockClear();
        drag("internal-width-resizer", 600);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
        drag("internal-width-resizer", 980);
        vi.mocked(canvas.scrollBy).mockClear();
        drag(null, 980);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("does not horizontally scroll past either end", () => {
        drag("internal-width-resizer", 250);
        canvas.scrollLeft = 400;
        drag("internal-width-resizer", 980);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("keeps height-resize vertical scrolling on the outer scroller", () => {
        drag("internal-height-resizer", 600, 780);
        expect(verticalScroller.scrollBy).toHaveBeenCalledWith({ top: 3 });
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("does not pan horizontally while resizing height near a canvas edge", () => {
        canvas.scrollLeft = 200;
        drag("internal-height-resizer", 250, 780);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
        expect(verticalScroller.scrollBy).toHaveBeenCalledWith({ top: 3 });
    });

    it("supports horizontal scrolling while dragging dashboard widgets", () => {
        drag("insight", 980);
        expect(canvas.scrollBy).toHaveBeenCalledWith({ left: 3 });
    });

    it("does not pan the canvas while the pointer is left of it, e.g. over the sidebar", () => {
        canvas.scrollLeft = 200;
        drag("insightListItem", 100);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("does not pan the canvas while the pointer is right of it", () => {
        drag("insight", 1100);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("does not pan the canvas while the pointer is above or below it", () => {
        canvas.scrollLeft = 200;
        drag("richTextListItem", 250, 100);
        drag("richTextListItem", 980, 1900);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("skips vertical containers whose content exactly fits", () => {
        canvas.style.overflowY = "auto";
        Object.defineProperties(canvas, {
            clientHeight: { value: 1600 },
            scrollHeight: { value: 1600 },
        });
        drag("insight", 600, 780);
        expect(verticalScroller.scrollBy).toHaveBeenCalledWith({ top: 3 });
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it.each([false, undefined])("does not pan horizontally when the flag is %s", (enableCanvasScroll) => {
        rerender({ enableCanvasScroll });
        drag("insight", 980);
        drag("internal-width-resizer", 980);
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });

    it("keeps vertical auto-scroll enabled when the flag is off", () => {
        rerender({ enableCanvasScroll: false });
        drag("insight", 600, 780);
        expect(verticalScroller.scrollBy).toHaveBeenCalledWith({ top: 3 });
    });

    it("preserves selection of exactly fitting vertical containers when the flag is off", () => {
        rerender({ enableCanvasScroll: false });
        canvas.style.overflowY = "auto";
        Object.defineProperties(canvas, {
            clientHeight: { value: 1600 },
            scrollHeight: { value: 1600 },
        });
        drag("insight", 600, 780);
        expect(canvas.scrollBy).toHaveBeenCalledWith({ top: 3 });
        expect(verticalScroller.scrollBy).not.toHaveBeenCalled();
    });

    it("stops active horizontal scrolling when the flag is turned off", () => {
        drag("internal-width-resizer", 980);
        vi.mocked(canvas.scrollBy).mockClear();
        rerender({ enableCanvasScroll: false });
        act(() => vi.advanceTimersByTime(20));
        expect(canvas.scrollBy).not.toHaveBeenCalled();
    });
});
