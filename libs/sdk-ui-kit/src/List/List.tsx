// (C) 2007-2026 GoodData Corporation

import {
    type CSSProperties,
    type ReactElement,
    type UIEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import cx from "classnames";

import { type IAccessibilityConfigBase } from "../typings/accessibility.js";

// it configures max number of records due to
// inefficiency with virtual memory allocation
// that causes application crash (TNT-787)
const MAX_NUMBER_OF_ROWS = 1000000;

const HALF_ROW = 0.5;
// delay (ms) after the last scroll event before onScrollEnd is fired
const SCROLL_END_DELAY = 100;
export const MAX_VISIBLE_ITEMS_COUNT = 10;
export const DEFAULT_ITEM_HEIGHT = 28;

/**
 * @internal
 */
export interface IListProps<T> {
    id?: string;
    className?: string;
    // No longer has any effect since the list no longer renders a fixed-data-table border.
    // Kept for backward compatibility; ignored.
    compensateBorder?: boolean;

    height?: number;
    width?: number;
    maxHeight?: number;

    items?: T[];
    itemsCount?: number;
    itemHeight?: number;
    maxVisibleItemsCount?: number;
    itemHeightGetter?: (index: number) => number;
    renderItem: (props: IRenderListItemProps<T>) => ReactElement;
    itemTitleGetter?: (item: T) => string;

    scrollToItem?: T;
    scrollDirection?: -1 | 1;
    onScrollStart?: ScrollCallback;
    onScrollEnd?: ScrollCallback;

    accessibilityConfig?: Pick<IAccessibilityConfigBase, "ariaLabelledBy" | "role">;
}

/**
 * @internal
 */
export interface IRenderListItemProps<T> {
    rowIndex: number;
    item: T;
    width: number;
    height: number;
    isFirst: boolean;
    isLast: boolean;
    focused?: boolean;
}

/**
 * @internal
 */
export type ScrollCallback = (visibleRowsStartIndex: number, visibleRowsEndIndex: number) => void;

/**
 * @internal
 */
export function List<T>({
    id,
    className = "",

    width = 200,
    height,
    maxHeight,

    items = [],
    itemsCount = items.length,
    itemHeight = DEFAULT_ITEM_HEIGHT,
    itemHeightGetter = null as unknown as (index: number) => number,
    maxVisibleItemsCount = MAX_VISIBLE_ITEMS_COUNT,
    renderItem,

    onScrollStart,
    onScrollEnd,

    scrollToItem,
    scrollDirection,

    accessibilityConfig,
}: IListProps<T>): ReactElement {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const rowsCount = Math.min(itemsCount, MAX_NUMBER_OF_ROWS);

    // when there are more items than fit, show half of the next row to hint scrollability
    const currentItemsCount =
        itemsCount > maxVisibleItemsCount ? maxVisibleItemsCount + HALF_ROW : itemsCount;

    const listHeight = height || currentItemsCount * itemHeight;
    // the visible viewport height; the list is prop-sized so this is deterministic
    const viewportHeight = maxHeight ? Math.min(maxHeight, listHeight) : listHeight;

    const estimateSize = useCallback(
        (index: number) => (itemHeightGetter ? itemHeightGetter(index) : itemHeight),
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
                cb({ width: rect.width || width, height: rect.height || viewportHeight });
            };
            report();
            if (typeof ResizeObserver === "undefined") {
                return undefined;
            }
            const resizeObserver = new ResizeObserver(report);
            resizeObserver.observe(el);
            return () => resizeObserver.disconnect();
        },
        [width, viewportHeight],
    );

    const rowVirtualizer = useVirtualizer({
        count: rowsCount,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize,
        observeElementRect,
        overscan: 5,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    // scroll the requested item into view (preserves the legacy +scrollDirection offset)
    const scrollToItemRowIndex = useMemo(() => {
        if (!scrollToItem) {
            return undefined;
        }
        const index = items.indexOf(scrollToItem);
        if (index < 0) {
            return undefined;
        }
        return index + (scrollDirection ?? 1);
    }, [items, scrollToItem, scrollDirection]);

    useEffect(() => {
        if (scrollToItemRowIndex === undefined || rowsCount === 0) {
            return;
        }
        rowVirtualizer.scrollToIndex(Math.min(Math.max(scrollToItemRowIndex, 0), rowsCount - 1));
        // rowVirtualizer identity is stable; intentionally only react to the target index changing
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollToItemRowIndex, rowsCount]);

    // converts vertical scroll position to the [first, last] visible item index range,
    // matching the legacy fixed-data-table-based behavior consumers (e.g. AsyncList) depend on
    const getVisibleScrollRange = useCallback(
        (scrollY: number): [number, number] => {
            const rowIndex = Math.floor(scrollY / itemHeight);
            const visibleRange = Math.ceil(listHeight / itemHeight);
            return [rowIndex, rowIndex + visibleRange];
        },
        [itemHeight, listHeight],
    );

    const isScrollingRef = useRef(false);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleScroll = useCallback(
        (event: UIEvent<HTMLDivElement>) => {
            const scrollY = event.currentTarget.scrollTop;
            const [startIndex, endIndex] = getVisibleScrollRange(scrollY);

            if (!isScrollingRef.current) {
                isScrollingRef.current = true;
                onScrollStart?.(startIndex, endIndex);
            }

            if (scrollEndTimerRef.current) {
                clearTimeout(scrollEndTimerRef.current);
            }
            scrollEndTimerRef.current = setTimeout(() => {
                isScrollingRef.current = false;
                onScrollEnd?.(startIndex, endIndex);
            }, SCROLL_END_DELAY);
        },
        [getVisibleScrollRange, onScrollStart, onScrollEnd],
    );

    // clear any pending scroll-end timer on unmount so callbacks don't fire on an unmounted tree
    useEffect(() => {
        return () => {
            if (scrollEndTimerRef.current) {
                clearTimeout(scrollEndTimerRef.current);
            }
        };
    }, []);

    const containerStyle = useMemo<CSSProperties>(
        () => ({
            width,
            height: maxHeight ? undefined : listHeight,
            maxHeight,
        }),
        [width, maxHeight, listHeight],
    );

    return (
        <div
            id={id}
            data-testid="gd-list"
            className={cx("gd-list gd-infinite-list", className)}
            style={{ width }}
            role={accessibilityConfig?.role}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
        >
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
                        const item = items[virtualRow.index];
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
                            >
                                {renderItem({
                                    rowIndex: virtualRow.index,
                                    item,
                                    width,
                                    height: virtualRow.size,
                                    isFirst: virtualRow.index === 0,
                                    isLast: virtualRow.index === itemsCount - 1,
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
