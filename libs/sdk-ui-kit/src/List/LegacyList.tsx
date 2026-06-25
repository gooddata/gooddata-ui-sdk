// (C) 2007-2026 GoodData Corporation

import {
    type CSSProperties,
    type ReactElement,
    type UIEvent,
    cloneElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import cx from "classnames";

import { type ScrollCallback } from "./List.js";

// it configures max number of records due to
// inefficiency with virtual memory allocation
// that causes application crash (TNT-787)
const MAX_NUMBER_OF_ROWS = 1000000;

// delay (ms) after the last scroll event before the scroll-end callback is fired
const SCROLL_END_DELAY = 100;

/**
 * @internal
 */
export interface ILegacyListProps {
    className?: string;
    // No longer has any effect since the list no longer renders a fixed-data-table border.
    // Kept for backward compatibility; ignored.
    compensateBorder?: boolean;
    dataSource: any;
    height?: number;
    itemHeight: number;
    itemHeightGetter?: () => number;
    onScroll?: ScrollCallback;
    onScrollStart?: ScrollCallback;
    onSelect?: (item: any) => void;
    scrollToSelected?: boolean;
    rowItem: ReactElement<any>;
    width?: number;
}

/**
 * @internal
 */
export interface ILegacyListState {
    selected: number;
}

/**
 * @deprecated  This component is deprecated use List instead
 * @internal
 */
export function LegacyList({
    className = "",
    onScroll = () => {},
    onScrollStart = () => {},
    onSelect = () => {},
    width = 200,
    height = 300,
    itemHeight = 28,
    itemHeightGetter = null as unknown as () => number,
    scrollToSelected = false,
    dataSource,
    rowItem,
}: ILegacyListProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const rowsCount = Math.min(dataSource.rowsCount, MAX_NUMBER_OF_ROWS);

    const estimateSize = useCallback(
        () => (itemHeightGetter ? itemHeightGetter() : itemHeight),
        [itemHeightGetter, itemHeight],
    );

    // Report the viewport size to the virtualizer from the known props, falling back from a real
    // measurement when the DOM has no layout (e.g. jsdom in tests). Keeps virtualization correct
    // without depending on layout being available.
    const observeElementRect = useCallback(
        (_instance: unknown, cb: (rect: { width: number; height: number }) => void) => {
            const el = scrollContainerRef.current;
            if (!el) {
                return undefined;
            }
            const report = () => {
                const rect = el.getBoundingClientRect();
                cb({ width: rect.width || width, height: rect.height || height });
            };
            report();
            if (typeof ResizeObserver === "undefined") {
                return undefined;
            }
            const resizeObserver = new ResizeObserver(report);
            resizeObserver.observe(el);
            return () => resizeObserver.disconnect();
        },
        [width, height],
    );

    const rowVirtualizer = useVirtualizer({
        count: rowsCount,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize,
        observeElementRect,
        overscan: 5,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    // index of the currently selected row, used to scroll it into view
    const selectedRowIndex = useMemo(() => {
        if (!scrollToSelected) {
            return undefined;
        }
        for (let row = 0; row < dataSource.rowsCount; row += 1) {
            if (dataSource.getObjectAt(row)?.selected) {
                return row;
            }
        }
        return undefined;
    }, [scrollToSelected, dataSource]);

    useEffect(() => {
        if (selectedRowIndex === undefined || rowsCount === 0) {
            return;
        }
        rowVirtualizer.scrollToIndex(Math.min(selectedRowIndex, rowsCount - 1));
        // rowVirtualizer identity is stable; intentionally only react to the selected index changing
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRowIndex, rowsCount]);

    // vertical scroll position is converted to the [first, last] visible item index range,
    // matching the legacy fixed-data-table-based behavior
    const getVisibleScrollRange = useCallback(
        (scrollY: number): [number, number] => {
            const rowIndex = Math.floor(scrollY / itemHeight);
            const visibleRange = Math.ceil(height / itemHeight);
            return [rowIndex, rowIndex + visibleRange];
        },
        [height, itemHeight],
    );

    const isScrollingRef = useRef(false);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleScroll = useCallback(
        (event: UIEvent<HTMLDivElement>) => {
            const scrollY = event.currentTarget.scrollTop;
            const [startIndex, endIndex] = getVisibleScrollRange(scrollY);

            if (!isScrollingRef.current) {
                isScrollingRef.current = true;
                onScrollStart(startIndex, endIndex);
            }

            if (scrollEndTimerRef.current) {
                clearTimeout(scrollEndTimerRef.current);
            }
            scrollEndTimerRef.current = setTimeout(() => {
                isScrollingRef.current = false;
                onScroll(startIndex, endIndex);
            }, SCROLL_END_DELAY);
        },
        [getVisibleScrollRange, onScrollStart, onScroll],
    );

    // clear any pending scroll-end timer on unmount so callbacks don't fire on an unmounted tree
    useEffect(() => {
        return () => {
            if (scrollEndTimerRef.current) {
                clearTimeout(scrollEndTimerRef.current);
            }
        };
    }, []);

    const handleSelect = useCallback(
        (rowIndex: number) => {
            const item = dataSource.getObjectAt(rowIndex);
            if (item) {
                onSelect(item);
            }
        },
        [dataSource, onSelect],
    );

    const classNames = useMemo(() => cx("gd-infinite-list", className), [className]);

    const containerStyle = useMemo<CSSProperties>(() => ({ width, height }), [width, height]);

    return (
        <div className={classNames} style={{ width }}>
            <div
                ref={scrollContainerRef}
                className="gd-infinite-list-scroll-container"
                style={containerStyle}
                onScroll={handleScroll}
            >
                <div
                    className="gd-infinite-list-sizer"
                    style={{ height: rowVirtualizer.getTotalSize(), width: "100%", position: "relative" }}
                >
                    {virtualItems.map((virtualRow) => {
                        const item = dataSource.getObjectAt(virtualRow.index);
                        const itemElement = cloneElement(rowItem, {
                            ...(item ? { item } : {}),
                            width,
                            isFirst: virtualRow.index === 0,
                            isLast: virtualRow.index === dataSource.rowsCount - 1,
                        });

                        return (
                            <div
                                key={virtualRow.key}
                                className="gd-infinite-list-item"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: virtualRow.size,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                                onClick={() => handleSelect(virtualRow.index)}
                            >
                                {itemElement}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
