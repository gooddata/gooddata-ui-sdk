// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DragLayerComponent } from "./DragLayer.js";

const { dragState, handlers } = vi.hoisted(() => ({
    dragState: {
        item: {},
        itemType: "internal-height-resizer",
        initialOffset: { x: 250, y: 700 },
        differenceFromInitialOffset: { x: 0, y: 0 },
        isDragging: false,
    },
    handlers: {
        setScrollCorrection: vi.fn(),
        toggleHeightLimitReached: vi.fn(),
        setWidthState: vi.fn(),
    },
}));

vi.mock("@evil-internetmann/react-dnd", () => ({ useDragLayer: () => dragState }));
vi.mock("../../dragAndDrop/LayoutResizeContext.js", () => ({ useResizeHandlers: () => handlers }));
vi.mock("./DragLayerPreview/ContentDragPreview.js", () => ({ ContentDragPreview: () => <div /> }));

function TestDashboard({
    hasResizeLayer = true,
    enableCanvasScroll = true,
}: {
    hasResizeLayer?: boolean;
    enableCanvasScroll?: boolean;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [resizeLayer, setResizeLayer] = useState<HTMLDivElement | null>(null);
    return (
        <>
            <DragLayerComponent
                contentRef={contentRef}
                resizeLayer={resizeLayer}
                enableCanvasScroll={enableCanvasScroll}
            />
            <div className="gd-dash-content-scroll-container">
                <div className="dash-section-kpis" ref={contentRef} />
            </div>
            {hasResizeLayer ? <div className="gd-dash-content-resize-layer" ref={setResizeLayer} /> : null}
        </>
    );
}

describe("DragLayerComponent", () => {
    let scrollLeft: number;
    let scrollTop: number;

    beforeEach(() => {
        scrollLeft = 0;
        scrollTop = 0;
        dragState.isDragging = false;
        dragState.itemType = "internal-height-resizer";
        dragState.initialOffset = { x: 250, y: 700 };
        dragState.item = {
            widgetHeights: [10],
            minLimit: 1,
            maxLimit: 40,
            initialLayoutDimensions: new DOMRect(250, 200, 1130, 1000),
        };
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
            this: HTMLElement,
        ) {
            return this.closest(".dash-section-kpis")
                ? new DOMRect(230 - scrollLeft, 200 - scrollTop, 1170, 1000)
                : this.closest(".gd-dash-content-resize-layer")
                  ? new DOMRect(230, 1200 - scrollTop, 770, 0)
                  : new DOMRect(0, 0, 1000, 1000);
        });
    });

    it.each([
        {
            itemType: "internal-height-resizer",
            expectedLeft: "-180px",
            expectedTop: "-460px",
            expectedWidthState: undefined,
        },
        {
            itemType: "internal-width-resizer",
            expectedLeft: "20px",
            expectedTop: "-500px",
            expectedWidthState: [{ initialIndex: 0, currentIndex: 2, limitReached: "none" }],
        },
    ])(
        "keeps the $itemType preview inside the horizontally clipped resize layer",
        ({ itemType, expectedLeft, expectedTop, expectedWidthState }) => {
            dragState.itemType = itemType;
            dragState.item = {
                ...dragState.item,
                minLimit: 1,
                maxLimit: 12,
                currentWidth: 3,
                gridColumnWidth: 100,
                gridColumnHeightInPx: 440,
                rowIndex: 0,
            };
            const { container, rerender } = render(<TestDashboard />);
            dragState.isDragging = true;
            rerender(<TestDashboard />);

            const canvas = container.querySelector(".gd-dash-content-scroll-container")!;
            const resizeLayer = container.querySelector(".gd-dash-content-resize-layer")!;
            expect(resizeLayer.querySelector(".drag-layer")).not.toBeNull();
            expect(canvas.querySelector(".drag-layer")).toBeNull();
            const preview = resizeLayer.querySelector(".gd-grid-layout-resizer-drag-preview")!;

            scrollLeft = 200;
            fireEvent.scroll(canvas);
            expect(preview).toHaveStyle({ top: "-500px", left: expectedLeft });

            scrollTop = 100;
            fireEvent.scroll(canvas);
            expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: -200, y: -100 });
            expect(preview).toHaveStyle({ top: expectedTop, left: expectedLeft });
            expect(handlers.setWidthState.mock.lastCall).toEqual(expectedWidthState);
        },
    );

    it("starts each resize from the current canvas scroll position", () => {
        scrollLeft = 200;
        dragState.initialOffset = { x: 50, y: 700 };
        const { container, rerender } = render(<TestDashboard />);
        dragState.isDragging = true;
        rerender(<TestDashboard />);
        expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: 0, y: 0 });
        expect(container.querySelector(".height-resizer-drag-preview")).toHaveStyle({ left: "-180px" });

        scrollLeft = 350;
        fireEvent.scroll(container.querySelector(".gd-dash-content-scroll-container")!);
        expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: -150, y: 0 });

        dragState.isDragging = false;
        rerender(<TestDashboard />);
        scrollLeft = 100;
        dragState.initialOffset = { x: 150, y: 700 };
        dragState.isDragging = true;
        rerender(<TestDashboard />);
        expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: 0, y: 0 });
        expect(container.querySelector(".height-resizer-drag-preview")).toHaveStyle({ left: "-80px" });
    });

    it("renders resize previews in place with relative positioning when there is no resize layer", () => {
        const { container, rerender } = render(<TestDashboard hasResizeLayer={false} />);
        dragState.isDragging = true;
        rerender(<TestDashboard hasResizeLayer={false} />);

        const layer = container.querySelector(".drag-layer");
        expect(layer?.parentElement).toBe(container);
        expect(layer).toHaveStyle({ position: "relative" });
        expect(layer?.querySelector(".height-resizer-drag-preview")).not.toBeNull();
    });

    it("moves the resize preview into the resize layer once it is mounted", () => {
        const { container, rerender } = render(<TestDashboard hasResizeLayer={false} />);
        dragState.isDragging = true;
        rerender(<TestDashboard hasResizeLayer={false} />);
        rerender(<TestDashboard />);

        const resizeLayer = container.querySelector(".gd-dash-content-resize-layer")!;
        expect(resizeLayer.querySelector(".drag-layer")).toHaveStyle({ position: "absolute" });
        expect(container.querySelectorAll(".drag-layer")).toHaveLength(1);
    });

    it("keeps ordinary widget drag previews outside the scroller and fixed", () => {
        const { container, rerender } = render(<TestDashboard />);
        dragState.itemType = "insight";
        dragState.isDragging = true;
        rerender(<TestDashboard />);

        expect(container.querySelector(".gd-dash-content-scroll-container .drag-layer")).toBeNull();
        expect(container.querySelector(".gd-dash-content-resize-layer .drag-layer")).toBeNull();
        expect(container.querySelector(".drag-layer")).toHaveStyle({ position: "fixed" });
    });

    it("keeps resize previews in place and measures the drag layer when the flag is off", () => {
        const { container, rerender } = render(<TestDashboard enableCanvasScroll={false} />);
        dragState.isDragging = true;
        rerender(<TestDashboard enableCanvasScroll={false} />);

        const layer = container.querySelector(".drag-layer");
        expect(layer?.parentElement).toBe(container);
        expect(layer).toHaveStyle({ position: "relative" });
        expect(container.querySelector(".gd-dash-content-resize-layer .drag-layer")).toBeNull();

        scrollLeft = 200;
        fireEvent.scroll(container.querySelector(".gd-dash-content-scroll-container")!);
        expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    });

    it("preserves vertical scroll correction for a legacy preview mounted below the page origin", () => {
        vi.mocked(HTMLElement.prototype.getBoundingClientRect).mockImplementation(function (
            this: HTMLElement,
        ) {
            return new DOMRect(0, this.classList.contains("drag-layer") ? 200 - scrollTop : 0, 1000, 0);
        });
        const { container, rerender } = render(<TestDashboard enableCanvasScroll={false} />);
        dragState.isDragging = true;
        rerender(<TestDashboard enableCanvasScroll={false} />);
        expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: 0, y: 0 });

        scrollTop = 100;
        fireEvent.scroll(container);
        expect(handlers.setScrollCorrection).toHaveBeenLastCalledWith({ x: 0, y: -100 });
    });
});
