// (C) 2022 GoodData Corporation
import { useDragDropManager } from "react-dnd";
import { RefObject, useEffect, useState } from "react";
import { DraggableItemType } from "./types.js";
import { useInterval } from "./useInterval.js";

const SCROLLING_STEP = 3;
const SCROLLING_INTERVAL = 5;
const SCROLLING_BOTTOM_ZONE_HEIGHT = 100;

const SCROLLING_ITEM_TYPES: DraggableItemType[] = [
    "insightListItem",
    "insight",
    "insight-placeholder",
    "kpi",
    "kpi-placeholder",
    "internal-width-resizer",
    "internal-height-resizer",
];

enum ScrollingDirection {
    Up = -1,
    Down = 1,
    None = 0,
}

export function useDashboardDragScroll(
    contentRef: RefObject<HTMLDivElement>,
    stickyHeaderRef: RefObject<HTMLDivElement>,
    stickyFooterRef: RefObject<HTMLDivElement>,
) {
    const [scrollingDirection, setScrollingDirection] = useState<ScrollingDirection>(ScrollingDirection.None);

    const dragDropManager = useDragDropManager();
    useEffect(() => {
        return dragDropManager.getMonitor().subscribeToOffsetChange(() => {
            const itemType = dragDropManager.getMonitor().getItemType() as DraggableItemType;
            const clientOffset = dragDropManager.getMonitor().getSourceClientOffset();

            const headerCoordinations = stickyHeaderRef.current?.getBoundingClientRect();
            const footerCoordinations = stickyFooterRef.current?.getBoundingClientRect();
            const contentCoordinations = contentRef.current?.getBoundingClientRect();

            if (
                (itemType && !SCROLLING_ITEM_TYPES.includes(itemType)) ||
                !clientOffset ||
                !headerCoordinations ||
                !footerCoordinations ||
                !contentCoordinations
            ) {
                setScrollingDirection(ScrollingDirection.None);
                return;
            }

            const shouldScrollUp =
                clientOffset.y <= headerCoordinations?.bottom &&
                headerCoordinations?.bottom > contentCoordinations?.top;
            if (shouldScrollUp) {
                setScrollingDirection(ScrollingDirection.Up);
                return;
            }

            const shouldScrollDown =
                clientOffset.y > footerCoordinations?.bottom - SCROLLING_BOTTOM_ZONE_HEIGHT &&
                contentCoordinations?.bottom > footerCoordinations?.bottom;
            if (shouldScrollDown) {
                setScrollingDirection(ScrollingDirection.Down);
                return;
            }

            setScrollingDirection(ScrollingDirection.None);
        });
        // we want to subscribe only once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useInterval(
        () => {
            const scrollingTop = scrollingDirection * SCROLLING_STEP;
            findScrollable(contentRef.current)?.scrollBy({
                top: scrollingTop,
            });
        },
        scrollingDirection === ScrollingDirection.None ? null : SCROLLING_INTERVAL,
    );
}

/**
 * function goes from element to its parents and finds first scrollable element
 */
function findScrollable(element: Node | HTMLElement | null): HTMLElement {
    if (!element) {
        return document.documentElement;
    }

    if (element instanceof HTMLElement) {
        const overflowY = window.getComputedStyle(element).overflowY;
        const isScrollable = overflowY !== "visible" && overflowY !== "hidden";

        if (isScrollable && element.scrollHeight >= element.clientHeight) {
            return element;
        }
    }

    return findScrollable(element.parentNode);
}
