// (C) 2024-2025 GoodData Corporation

import React, { useEffect, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { UiSkeleton } from "../UiSkeleton/UiSkeleton.js";
import { bem } from "../@utils/bem.js";
import { makeLinearKeyboardNavigation } from "../@utils/keyboardNavigation.js";

const { b, e } = bem("gd-ui-kit-paged-virtual-list");

/**
 * @internal
 */
export interface UiPagedVirtualListSkeletonItemProps {
    itemHeight: number;
}

/**
 * @internal
 */
export interface UiPagedVirtualListProps<T> {
    maxHeight: number;
    items?: T[];
    itemHeight: number;
    itemsGap: number;
    itemPadding: number;
    skeletonItemsCount: number;
    hasNextPage?: boolean;
    loadNextPage?: () => void;
    customKeyboardNavigationHandler?: (event: React.KeyboardEvent<Element>) => void;
    onKeyDownSelect?: (item: T) => void;
    closeDropdown?: () => void;
    isLoading?: boolean;
    tabIndex?: number;
    /**
     * An item in the list that should be scrolled into view when the component renders.
     * By default, items are compared by object identity (i.e., `===`).
     * To customize how the target item is found (e.g., by ID), provide a `scrollToItemKeyExtractor` as well.
     */
    scrollToItem?: T;
    /**
     * A function that extracts a unique key from each item for comparison with `scrollToItem`.
     * This is useful when the provided `scrollToItem` may not be the same object reference as items in the list.
     * If not provided, object identity (`===`) is used for comparison.
     */
    scrollToItemKeyExtractor?: (item: T) => string | number;
    scrollToIndex?: number;
    shouldLoadNextPage?: (lastItemIndex: number, itemsCount: number, skeletonItemsCount: number) => boolean;
    children: (item: T) => React.ReactNode;
    scrollbarHoverEffect?: boolean;
    SkeletonItem?: React.ComponentType<UiPagedVirtualListSkeletonItemProps>;
}

/**
 * @internal
 */
export function UiPagedVirtualList<T>(props: UiPagedVirtualListProps<T>) {
    const {
        SkeletonItem = UiSkeleton,
        items,
        itemHeight,
        itemsGap,
        itemPadding,
        tabIndex = 0,
        onKeyDownSelect,
        closeDropdown,
        customKeyboardNavigationHandler,
        children,
        scrollbarHoverEffect,
    } = props;

    const { itemsCount, scrollContainerRef, height, hasScroll, rowVirtualizer, virtualItems } =
        useVirtualList(props);

    const { focusedIndex, onKeyboardNavigation } = useVirtualListKeyboardNavigation(
        items,
        onKeyDownSelect,
        closeDropdown,
    );

    return (
        <div
            className={b({
                hasScroll,
            })}
            tabIndex={tabIndex}
            onKeyDown={customKeyboardNavigationHandler ?? onKeyboardNavigation}
        >
            <div
                ref={scrollContainerRef}
                className={e("scroll-container", { hover: scrollbarHoverEffect })}
                style={{ height, paddingTop: itemsGap }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {virtualItems.map((virtualRow) => {
                        const item = items?.[virtualRow.index];
                        const isSkeletonItem = virtualRow.index > itemsCount - 1;

                        const style: React.CSSProperties = {
                            width: `calc(100% + ${hasScroll ? "10px" : "0px"})`,
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                            paddingRight: itemPadding,
                            paddingLeft: itemPadding,
                        };

                        return (
                            <div
                                key={virtualRow.index}
                                className={e("item", { isFocused: focusedIndex === virtualRow.index })}
                                style={style}
                            >
                                {isSkeletonItem ? (
                                    <SkeletonItem key={virtualRow.index} itemHeight={itemHeight} />
                                ) : (
                                    children(item!)
                                )}
                                <div className={e("gap")} style={{ height: itemsGap }} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function useVirtualList<T>(props: UiPagedVirtualListProps<T>) {
    const {
        items,
        itemHeight,
        itemsGap,
        skeletonItemsCount,
        hasNextPage,
        loadNextPage,
        isLoading,
        maxHeight,
        scrollToItem,
        scrollToItemKeyExtractor,
        scrollToIndex,
        shouldLoadNextPage: shouldLoadNextPageProps,
    } = props;

    const defaultShouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number, skeletonItemsCount: number) =>
            lastItemIndex >= itemsCount - 1 - skeletonItemsCount,
        [],
    );

    const shouldLoadNextPage = useMemo(() => {
        return shouldLoadNextPageProps ?? defaultShouldLoadNextPage;
    }, [shouldLoadNextPageProps, defaultShouldLoadNextPage]);

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const itemsCount = items ? items.length : 0;

    let renderItemsCount = itemsCount;
    if (hasNextPage) {
        renderItemsCount = itemsCount + skeletonItemsCount;
    } else if (itemsCount === 0 && isLoading) {
        renderItemsCount = skeletonItemsCount;
    }

    //
    const realHeight =
        itemsCount > 0
            ? (itemHeight + itemsGap) * itemsCount + itemsGap
            : skeletonItemsCount * (itemHeight + itemsGap) + itemsGap;

    const height = Math.min(maxHeight, realHeight);

    const hasScroll = scrollContainerRef.current
        ? scrollContainerRef.current?.scrollHeight >
          scrollContainerRef.current?.getBoundingClientRect().height
        : false;

    const rowVirtualizer = useVirtualizer({
        count: renderItemsCount,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: () => itemHeight + itemsGap,
        overscan: 5,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    useEffect(() => {
        const [lastItem] = [...virtualItems].reverse();

        if (!lastItem) {
            return;
        }

        if (shouldLoadNextPage(lastItem.index, itemsCount, skeletonItemsCount) && hasNextPage && !isLoading) {
            loadNextPage?.();
        }
    }, [
        hasNextPage,
        loadNextPage,
        itemsCount,
        isLoading,
        virtualItems,
        skeletonItemsCount,
        shouldLoadNextPage,
    ]);

    // Add scroll into view effect
    useEffect(() => {
        if (!scrollToItem || !items || items.length === 0) {
            return;
        }

        const findItemIndex = () => {
            if (scrollToItemKeyExtractor) {
                const targetKey = scrollToItemKeyExtractor(scrollToItem);
                return items.findIndex((item) => scrollToItemKeyExtractor(item) === targetKey);
            } else {
                return items.findIndex((item) => item === scrollToItem);
            }
        };

        const index = findItemIndex();

        if (index === -1) {
            return;
        }

        rowVirtualizer.scrollToIndex(index, {
            align: "center",
            behavior: "smooth",
        });
    }, [scrollToItem, items, rowVirtualizer, itemHeight, itemsGap, scrollToItemKeyExtractor]);

    useEffect(() => {
        if (scrollToIndex !== undefined) {
            rowVirtualizer.scrollToIndex(scrollToIndex, {
                align: "center",
                behavior: "smooth",
            });
        }
    }, [scrollToIndex, rowVirtualizer]);

    return {
        itemsCount,
        scrollContainerRef,
        height,
        hasScroll,
        rowVirtualizer,
        virtualItems,
    };
}

function useVirtualListKeyboardNavigation<T>(
    items: T[],
    onKeyDownSelect?: (item: T) => void,
    closeDropdown?: () => void,
) {
    const [focusedIndex, setFocusedIndex] = React.useState<number>(0);

    useEffect(() => {
        setFocusedIndex(0);
    }, [items]);

    const virtualListKeyboardNavigationHandler = React.useMemo(
        () =>
            makeLinearKeyboardNavigation({
                onFocusNext: () => {
                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex >= items.length) {
                            return 0;
                        }
                        return nextIndex;
                    });
                },
                onFocusPrevious: () => {
                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex - 1;
                        if (nextIndex < 0) {
                            return items.length - 1;
                        }
                        return nextIndex;
                    });
                },
                onFocusFirst: () => {
                    setFocusedIndex(0);
                },
                onFocusLast: () => {
                    setFocusedIndex(items.length - 1);
                },
                onSelect: () => {
                    onKeyDownSelect?.(items[focusedIndex]);
                    closeDropdown?.();
                },
                onClose: (e) => {
                    e.preventDefault();
                    closeDropdown?.();
                },
            }),
        [items, focusedIndex, onKeyDownSelect, closeDropdown],
    );

    return {
        focusedIndex,
        onKeyboardNavigation: virtualListKeyboardNavigationHandler,
    };
}
