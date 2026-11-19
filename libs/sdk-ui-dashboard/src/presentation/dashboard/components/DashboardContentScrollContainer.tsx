// (C) 2026 GoodData Corporation

import { type ReactNode, type RefObject, useCallback, useId, useLayoutEffect, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

interface IDashboardContentScrollContainerProps {
    children: ReactNode;
    contentRef: RefObject<HTMLDivElement | null>;
    isEditMode: boolean;
    onScrollGeometryChange?: (width: number, scrollLeft: number) => void;
}

/**
 * Scrolls the edit-mode canvas horizontally and renders a synchronized proxy scrollbar that sticks
 * to the bottom of the viewport, so it stays reachable on tall dashboards.
 *
 * The proxy scrollbar is expected to be exactly as wide as the canvas viewport (both span the main
 * content column); its inner spacer then mirrors the canvas scroll width one to one.
 */
export function DashboardContentScrollContainer({
    children,
    contentRef,
    isEditMode,
    onScrollGeometryChange,
}: IDashboardContentScrollContainerProps) {
    const intl = useIntl();
    const canvasId = useId();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollbarRef = useRef<HTMLDivElement>(null);
    const contentWidthRef = useRef(0);
    const reportedGeometryRef = useRef<{ width: number; scrollLeft: number } | null>(null);
    const [scrollWidth, setScrollWidth] = useState(0);

    const reportScrollGeometry = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!isEditMode || !container) {
            return;
        }

        const width = contentWidthRef.current;
        const { scrollLeft } = container;
        const reported = reportedGeometryRef.current;
        // Both synchronized elements fire a scroll event for a single user scroll; report it once.
        if (reported?.width === width && reported.scrollLeft === scrollLeft) {
            return;
        }
        reportedGeometryRef.current = { width, scrollLeft };
        onScrollGeometryChange?.(width, scrollLeft);
    }, [isEditMode, onScrollGeometryChange]);

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        const content = contentRef.current;
        if (!isEditMode || !container || !content) {
            return;
        }

        const updateWidth = () => {
            // Layout is read only on resize; scroll events reuse the cached content width.
            contentWidthRef.current = content.getBoundingClientRect().width;
            setScrollWidth(container.scrollWidth > container.clientWidth ? container.scrollWidth : 0);
            reportScrollGeometry();
        };
        const observer = new ResizeObserver(updateWidth);
        observer.observe(container);
        observer.observe(content);
        updateWidth();

        return () => {
            observer.disconnect();
            reportedGeometryRef.current = null;
        };
    }, [contentRef, isEditMode, reportScrollGeometry]);

    useLayoutEffect(() => {
        const scrollbar = scrollbarRef.current;
        const container = scrollContainerRef.current;
        if (scrollbar && container) {
            scrollbar.scrollLeft = container.scrollLeft;
            updateScrollbarValue(scrollbar, container);
        }
    }, [scrollWidth, isEditMode]);

    const isScrollable = isEditMode && scrollWidth > 0;

    return (
        <>
            <div
                id={canvasId}
                className={cx("gd-dash-content-scroll-container", {
                    // Only clip the canvas while it actually overflows; a fitting canvas keeps
                    // overflowing hotspots, resize overlays and sticky children unclipped.
                    "gd-dash-content-scroll-container--scrollable": isScrollable,
                })}
                ref={scrollContainerRef}
                onScroll={(event) => {
                    const scrollbar = scrollbarRef.current;
                    if (scrollbar && scrollbar.scrollLeft !== event.currentTarget.scrollLeft) {
                        scrollbar.scrollLeft = event.currentTarget.scrollLeft;
                    }
                    if (scrollbar) {
                        updateScrollbarValue(scrollbar, event.currentTarget);
                    }
                    reportScrollGeometry();
                }}
            >
                {children}
            </div>
            <div
                className="gd-dash-content-scrollbar"
                ref={scrollbarRef}
                hidden={!isScrollable}
                tabIndex={0}
                role="scrollbar"
                aria-controls={canvasId}
                aria-orientation="horizontal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
                aria-label={intl.formatMessage({ id: "dashboard.content.horizontalScroll" })}
                onScroll={(event) => {
                    const container = scrollContainerRef.current;
                    if (container && container.scrollLeft !== event.currentTarget.scrollLeft) {
                        container.scrollLeft = event.currentTarget.scrollLeft;
                    }
                    if (container) {
                        updateScrollbarValue(event.currentTarget, container);
                    }
                    reportScrollGeometry();
                }}
            >
                <div style={{ width: scrollWidth, height: 1 }} />
            </div>
        </>
    );
}

/**
 * Updates the scrollbar value directly on the DOM so that scrolling does not re-render the dashboard.
 */
function updateScrollbarValue(scrollbar: HTMLElement, container: HTMLElement) {
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const value = maxScrollLeft > 0 ? Math.round((container.scrollLeft / maxScrollLeft) * 100) : 0;
    scrollbar.setAttribute("aria-valuenow", String(Math.min(100, Math.max(0, value))));
}
