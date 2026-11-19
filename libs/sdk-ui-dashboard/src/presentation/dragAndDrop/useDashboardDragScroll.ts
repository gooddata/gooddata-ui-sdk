// (C) 2022-2026 GoodData Corporation

import { type RefObject, useEffect, useRef, useState } from "react";

import { useDragDropManager } from "@evil-internetmann/react-dnd";

import { type DraggableItemType } from "./types.js";
import { useInterval } from "./useInterval.js";

const SCROLLING_STEP = 3;
const SCROLLING_INTERVAL = 5;
const SCROLLING_ZONE_HEIGHT = 100;
const SCROLLING_ZONE_WIDTH = 100;

const SCROLLING_ITEM_TYPES: DraggableItemType[] = [
    "insightListItem",
    "insight",
    "insight-placeholder",
    "kpi",
    "kpi-placeholder",
    "richText",
    "richTextListItem",
    "visualizationSwitcher",
    "visualizationSwitcherListItem",
    "dashboardLayout",
    "dashboardLayoutListItem",
    "internal-height-resizer",
];

enum ScrollingDirection {
    Up = -1,
    Down = 1,
    None = 0,
}

export function useDashboardDragScroll(
    contentRef: RefObject<HTMLDivElement | null>,
    stickyHeaderRef: RefObject<HTMLDivElement | null>,
    stickyFooterRef: RefObject<HTMLDivElement | null>,
    enableCanvasScroll = false,
) {
    const [scrollingDirection, setScrollingDirection] = useState<ScrollingDirection>(ScrollingDirection.None);
    const [horizontalScrollingDirection, setHorizontalScrollingDirection] = useState(0);
    // Resolved once per drag; `undefined` means it was not looked up yet for the current drag.
    const horizontalScrollerRef = useRef<HTMLElement | null | undefined>(undefined);

    const dragDropManager = useDragDropManager();
    useEffect(() => {
        setScrollingDirection(ScrollingDirection.None);
        setHorizontalScrollingDirection(0);
        horizontalScrollerRef.current = undefined;
        return dragDropManager.getMonitor().subscribeToOffsetChange(() => {
            const itemType = dragDropManager.getMonitor().getItemType() as DraggableItemType;
            const clientOffset = dragDropManager.getMonitor().getSourceClientOffset();
            const initialClientOffset = dragDropManager.getMonitor().getInitialClientOffset();
            const initialSourceClientOffset = dragDropManager.getMonitor().getInitialSourceClientOffset();

            const headerCoordinations = stickyHeaderRef.current?.getBoundingClientRect();
            const footerCoordinations = stickyFooterRef.current?.getBoundingClientRect();
            const contentCoordinations = contentRef.current?.getBoundingClientRect();

            if (
                !itemType ||
                (!SCROLLING_ITEM_TYPES.includes(itemType) &&
                    !(enableCanvasScroll && itemType === "internal-width-resizer")) ||
                !clientOffset ||
                !headerCoordinations ||
                !footerCoordinations ||
                !contentCoordinations ||
                !initialClientOffset ||
                !initialSourceClientOffset
            ) {
                setScrollingDirection(ScrollingDirection.None);
                setHorizontalScrollingDirection(0);
                horizontalScrollerRef.current = undefined;
                return;
            }

            if (enableCanvasScroll && horizontalScrollerRef.current === undefined) {
                horizontalScrollerRef.current = findHorizontalScrollable(contentRef.current);
            }
            const horizontalScroller =
                !enableCanvasScroll || itemType === "internal-height-resizer"
                    ? null
                    : horizontalScrollerRef.current;
            const normalizedClientOffsetX =
                clientOffset.x + initialClientOffset.x - initialSourceClientOffset.x;
            const normalizedClientOffsetY =
                clientOffset.y + initialClientOffset.y - initialSourceClientOffset.y;
            setHorizontalScrollingDirection(
                getHorizontalScrollingDirection(
                    horizontalScroller?.getBoundingClientRect(),
                    normalizedClientOffsetX,
                    normalizedClientOffsetY,
                ),
            );

            if (itemType === "internal-width-resizer") {
                setScrollingDirection(ScrollingDirection.None);
                return;
            }

            const shouldScrollUp =
                normalizedClientOffsetY <= headerCoordinations?.bottom + SCROLLING_ZONE_HEIGHT &&
                headerCoordinations?.bottom > contentCoordinations?.top;

            if (shouldScrollUp) {
                setScrollingDirection(ScrollingDirection.Up);
                return;
            }

            const shouldScrollDown =
                normalizedClientOffsetY > footerCoordinations?.bottom - SCROLLING_ZONE_HEIGHT &&
                contentCoordinations?.bottom > footerCoordinations?.bottom;

            if (shouldScrollDown) {
                setScrollingDirection(ScrollingDirection.Down);
                return;
            }

            setScrollingDirection(ScrollingDirection.None);
        });
    }, [contentRef, dragDropManager, enableCanvasScroll, stickyFooterRef, stickyHeaderRef]);

    useInterval(
        () => {
            const scrollingTop = scrollingDirection * SCROLLING_STEP;
            findScrollable(contentRef.current, enableCanvasScroll)?.scrollBy({
                top: scrollingTop,
            });
        },
        scrollingDirection === ScrollingDirection.None ? null : SCROLLING_INTERVAL,
    );

    useInterval(
        () => {
            const horizontalScroller = horizontalScrollerRef.current;
            if (
                horizontalScroller &&
                ((horizontalScrollingDirection < 0 && horizontalScroller.scrollLeft > 0) ||
                    (horizontalScrollingDirection > 0 &&
                        horizontalScroller.scrollLeft + horizontalScroller.clientWidth <
                            horizontalScroller.scrollWidth))
            ) {
                horizontalScroller.scrollBy({ left: horizontalScrollingDirection * SCROLLING_STEP });
            }
        },
        !enableCanvasScroll || horizontalScrollingDirection === 0 ? null : SCROLLING_INTERVAL,
    );
}

/**
 * Pans only while the pointer is over the horizontally scrollable canvas, so dragging from the sidebar,
 * header or filter bar never scrolls the canvas back to its start.
 */
function getHorizontalScrollingDirection(bounds: DOMRect | undefined, x: number, y: number): number {
    if (!bounds || x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
        return 0;
    }
    if (x < bounds.left + SCROLLING_ZONE_WIDTH) {
        return -1;
    }
    if (x > bounds.right - SCROLLING_ZONE_WIDTH) {
        return 1;
    }
    return 0;
}

function findHorizontalScrollable(element: HTMLElement | null): HTMLElement | null {
    if (!element) {
        return null;
    }
    const overflowX = window.getComputedStyle(element).overflowX;
    if ((overflowX === "auto" || overflowX === "scroll") && element.scrollWidth > element.clientWidth) {
        return element;
    }
    return findHorizontalScrollable(element.parentElement);
}

/**
 * function goes from element to its parents and finds first scrollable element
 * with actual overflow when canvas scrolling is enabled
 */
function findScrollable(element: Node | HTMLElement | null, requireOverflow: boolean): HTMLElement {
    if (!element) {
        return document.documentElement;
    }

    if (element instanceof HTMLElement) {
        const overflowY = window.getComputedStyle(element).overflowY;
        const isScrollable = overflowY !== "visible" && overflowY !== "hidden";

        if (
            isScrollable &&
            (requireOverflow
                ? element.scrollHeight > element.clientHeight
                : element.scrollHeight >= element.clientHeight)
        ) {
            return element;
        }
    }

    return findScrollable(element.parentNode, requireOverflow);
}
