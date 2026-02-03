// (C) 2024-2026 GoodData Corporation

import {
    type CSSProperties,
    type ComponentType,
    type KeyboardEvent,
    type ReactNode,
    type Ref,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import { forwardRefWithGenerics } from "@gooddata/sdk-ui";

import { bem } from "../@utils/bem.js";
import { makeLinearKeyboardNavigationWithConfirm } from "../@utils/keyboardNavigation.js";
import { SELECT_ITEM_ACTION } from "../hooks/useListWithActionsKeyboardNavigation.js";
import { ScopedIdStore } from "../hooks/useScopedId.js";
import { UiSkeleton } from "../UiSkeleton/UiSkeleton.js";
const { b, e } = bem("gd-ui-kit-paged-virtual-list");

/**
 * @internal
 */
export interface IUiPagedVirtualListSkeletonItemProps {
    itemHeight: number;
}

/**
 * @internal
 */
export interface IUiPagedVirtualListProps<T> {
    maxHeight: number;
    items?: T[];
    itemHeight: number;
    itemsGap: number;
    containerPadding?: number;
    itemPadding: number;
    skeletonItemsCount: number;
    hasNextPage?: boolean;
    loadNextPage?: () => void;
    customKeyboardNavigationHandler?: (event: KeyboardEvent<Element>) => void;
    onKeyDownSelect?: (item: T) => void;
    onKeyDownConfirm?: (item: T) => void;
    closeDropdown?: () => void;
    isLoading?: boolean;
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
    children: (item: T, focusedIndex?: number) => ReactNode;
    scrollbarHoverEffect?: boolean;
    SkeletonItem?: ComponentType<IUiPagedVirtualListSkeletonItemProps>;
    representAs?: "grid" | "listbox";
    listboxProps?: Record<string, any>;
    // keyboard and focus management
    tabIndex?: number; // tabindex=-1 means that keyboard navigation and focus are handled by the parent
    focusedItem?: T;
    focusedAction?: string;
    getIsItemSelected?: (item: T) => boolean;
    itemHeightGetter?: (index: number) => number;
    onScroll?: () => void;
    handleFocusIndexChange?: boolean; // this is internal flag that navigate focused item and trigger pagination default is true
}

/**
 * @internal
 */
export interface IUiPagedVirtualListImperativeHandle<T> {
    scrollToItem: (item: T) => void;
}

function UiPagedVirtualListNotWrapped<T>(
    props: IUiPagedVirtualListProps<T>,
    ref: Ref<IUiPagedVirtualListImperativeHandle<T>>,
) {
    const {
        SkeletonItem = UiSkeleton,
        items,
        itemHeight,
        itemsGap,
        itemPadding,
        containerPadding = 0,
        tabIndex = 0,
        onKeyDownSelect,
        onKeyDownConfirm,
        closeDropdown,
        customKeyboardNavigationHandler,
        children,
        scrollbarHoverEffect,
        representAs = "grid",
        focusedItem,
        focusedAction,
        listboxProps,
        getIsItemSelected,
        itemHeightGetter,
        onScroll,
        // NOTE: UiPagedVirtualListNotWrapped has built-in keyboard navigation (keydown).
        // When the user navigates to the last item and pagination is available,
        // the next page is automatically loaded.
        //
        // This behavior is enabled by default.
        // In case of issues with custom overrides, it can be disabled via this flag.
        //
        // TODO: Once keyboard navigation and virtual paging are unified,
        // remove this flag entirely.
        // For now, all lists use this behavior by default; set it to false if problems occur.
        handleFocusIndexChange = true,
    } = props;

    const {
        itemsCount,
        scrollContainerRef,
        height,
        hasScroll,
        rowVirtualizer,
        virtualItems,
        scrollToIndexWithPagination,
    } = useVirtualList(props);

    useImperativeHandle(ref, () => ({
        scrollToItem: (item: T) => {
            const itemIndex = items?.findIndex((i) => i === item) ?? -1;
            if (itemIndex >= 0) {
                rowVirtualizer.scrollToIndex(itemIndex, {
                    align: "center",
                    behavior: "smooth",
                });
            }
        },
    }));

    // when tabindex is -1 this keyboard navigation and focusIndex is not used at all
    const { focusedIndex, onKeyboardNavigation, isKeyboardNavigationRef } = useVirtualListKeyboardNavigation(
        items ?? [],
        onKeyDownSelect,
        onKeyDownConfirm,
        closeDropdown,
        handleFocusIndexChange,
    );
    const ListElement = representAs === "grid" ? "div" : "ul";
    const ItemElement = representAs === "grid" ? "div" : "li";
    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);
    const focusedItemIndex = focusedItem ? items?.indexOf(focusedItem) : 0;
    const finalFocusedIndex = focusedItem ? focusedItemIndex : focusedIndex;

    // Scroll to focused item when it changes via keyboard navigation
    // and trigger pagination if the focused item is near the end of loaded items
    // Only scroll if the focus change was caused by keyboard navigation, not by items loading
    useEffect(() => {
        if (
            finalFocusedIndex !== undefined &&
            finalFocusedIndex >= 0 &&
            tabIndex >= 0 &&
            isKeyboardNavigationRef.current &&
            handleFocusIndexChange
        ) {
            scrollToIndexWithPagination(finalFocusedIndex);
            // Reset the flag after scrolling
            isKeyboardNavigationRef.current = false;
        }
    }, [
        finalFocusedIndex,
        scrollToIndexWithPagination,
        tabIndex,
        isKeyboardNavigationRef,
        handleFocusIndexChange,
    ]);

    return (
        <div
            className={b({
                hasScroll,
            })}
        >
            <div
                ref={scrollContainerRef}
                className={e("scroll-container", { hover: scrollbarHoverEffect ?? false })}
                style={{ height, paddingTop: itemsGap + containerPadding }}
                onScroll={onScroll}
            >
                <ListElement
                    className={e("list")}
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                    tabIndex={tabIndex}
                    onKeyDown={
                        tabIndex < 0 ? undefined : (customKeyboardNavigationHandler ?? onKeyboardNavigation)
                    }
                    role={
                        representAs === "grid"
                            ? "rowgroup"
                            : representAs === "listbox"
                              ? "listbox"
                              : undefined
                    }
                    {...listboxProps}
                >
                    {virtualItems.map((virtualRow) => {
                        const item = items?.[virtualRow.index];
                        const isSkeletonItem = virtualRow.index > itemsCount - 1;
                        const baseItemHeight =
                            virtualRow.index >= itemsCount
                                ? itemHeight
                                : (itemHeightGetter?.(virtualRow.index) ?? itemHeight);

                        const style: CSSProperties = {
                            width: `calc(100% + ${hasScroll ? "10px" : "0px"})`,
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                            paddingRight: itemPadding,
                            paddingLeft: itemPadding,
                        };

                        const itemProps =
                            representAs === "listbox"
                                ? {
                                      role: "option",
                                      "aria-selected":
                                          getIsItemSelected && item ? getIsItemSelected(item) : undefined,
                                      "aria-posinset": virtualRow.index + 1,
                                      "aria-setsize": items?.length ?? 0,
                                      tabIndex:
                                          focusedItem === item && focusedAction === SELECT_ITEM_ACTION
                                              ? 0
                                              : -1,
                                      id: item
                                          ? makeId?.({ item, specifier: SELECT_ITEM_ACTION })
                                          : undefined,
                                  }
                                : {};

                        return (
                            <ItemElement
                                key={virtualRow.index}
                                className={e("item", {
                                    isFocused:
                                        !customKeyboardNavigationHandler &&
                                        finalFocusedIndex === virtualRow.index,
                                })}
                                style={style}
                                {...itemProps}
                            >
                                {isSkeletonItem ? (
                                    <SkeletonItem key={virtualRow.index} itemHeight={baseItemHeight} />
                                ) : (
                                    children(item!, virtualRow.index)
                                )}
                                {itemsGap !== 0 && <div className={e("gap")} style={{ height: itemsGap }} />}
                            </ItemElement>
                        );
                    })}
                </ListElement>
            </div>
        </div>
    );
}

/**
 * @internal
 */
export const UiPagedVirtualList = forwardRefWithGenerics(UiPagedVirtualListNotWrapped);

function useVirtualList<T>({
    items,
    itemHeight,
    itemHeightGetter,
    itemsGap,
    containerPadding = 0,
    skeletonItemsCount,
    hasNextPage,
    loadNextPage,
    isLoading,
    maxHeight,
    scrollToItem,
    scrollToItemKeyExtractor,
    scrollToIndex,
    shouldLoadNextPage: shouldLoadNextPageProps,
}: IUiPagedVirtualListProps<T>) {
    const defaultShouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number, skeletonItemsCount: number) =>
            lastItemIndex >= itemsCount - 1 - skeletonItemsCount,
        [],
    );

    const shouldLoadNextPage = useMemo(() => {
        return shouldLoadNextPageProps ?? defaultShouldLoadNextPage;
    }, [shouldLoadNextPageProps, defaultShouldLoadNextPage]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const prevScrollToItemRef = useRef<T | undefined>(undefined);

    const itemsCount = items ? items.length : 0;

    const renderItemsCount = useMemo(() => {
        if (hasNextPage) {
            return itemsCount + skeletonItemsCount;
        }

        if (itemsCount === 0 && isLoading) {
            return skeletonItemsCount;
        }

        return itemsCount;
    }, [hasNextPage, itemsCount, isLoading, skeletonItemsCount]);

    const getItemBaseHeight = useCallback(
        (index: number) => {
            if (index >= itemsCount) {
                return itemHeight;
            }

            return itemHeightGetter?.(index) ?? itemHeight;
        },
        [itemHeightGetter, itemHeight, itemsCount],
    );

    const getItemSizeWithGap = useCallback(
        (index: number) => getItemBaseHeight(index) + itemsGap,
        [getItemBaseHeight, itemsGap],
    );

    const realHeight = useMemo(() => {
        if (renderItemsCount === 0) {
            return 0;
        }

        let totalHeight = itemsGap;

        for (let index = 0; index < renderItemsCount; index += 1) {
            totalHeight += getItemSizeWithGap(index);
        }

        return totalHeight;
    }, [getItemSizeWithGap, itemsGap, renderItemsCount]);

    const height = Math.min(maxHeight, realHeight) + containerPadding;

    const hasScroll = scrollContainerRef.current
        ? scrollContainerRef.current?.scrollHeight >
          scrollContainerRef.current?.getBoundingClientRect().height
        : false;

    const rowVirtualizer = useVirtualizer({
        count: renderItemsCount,
        getScrollElement: () => scrollContainerRef.current,
        estimateSize: (index) => getItemSizeWithGap(index),
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
        // Reset the ref when scrollToItem becomes undefined so future scrolls work
        if (!scrollToItem) {
            prevScrollToItemRef.current = undefined;
            return;
        }

        if (!items || items.length === 0) {
            return;
        }

        // Determine if scrollToItem has actually changed to avoid scrolling
        // when new batches of items are loaded during pagination
        const isSameScrollTarget = checkIsSameScrollTarget(
            prevScrollToItemRef.current,
            scrollToItem,
            scrollToItemKeyExtractor,
        );

        if (isSameScrollTarget) {
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

        // Update ref to current scrollToItem after finding it
        prevScrollToItemRef.current = scrollToItem;

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

    // Function to scroll to a specific index and trigger pagination if needed
    const scrollToIndexWithPagination = useCallback(
        (index: number) => {
            if (index < 0) {
                return;
            }
            rowVirtualizer.scrollToIndex(index, {
                align: "auto",
            });
            // Also trigger pagination check - handles case when keyboard navigation
            // moves focus faster than the scroll/virtualItems update cycle
            if (shouldLoadNextPage(index, itemsCount, skeletonItemsCount) && hasNextPage && !isLoading) {
                loadNextPage?.();
            }
        },
        [
            rowVirtualizer,
            shouldLoadNextPage,
            itemsCount,
            skeletonItemsCount,
            hasNextPage,
            isLoading,
            loadNextPage,
        ],
    );

    return {
        itemsCount,
        scrollContainerRef,
        height,
        hasScroll,
        rowVirtualizer,
        virtualItems,
        scrollToIndexWithPagination,
    };
}

function useVirtualListKeyboardNavigation<T>(
    items: T[],
    onKeyDownSelect?: (item: T) => void,
    onKeyDownConfirm?: (item: T) => void,
    closeDropdown?: () => void,
    handleFocusIndexChange?: boolean, // this is internal flag that navigate focuesed item and trigger pagination if needed
) {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const prevItemsLengthRef = useRef<number>(items.length);
    // Track if the last focus change was caused by keyboard navigation
    // This prevents scrolling to focused item when items are loaded via pagination
    const isKeyboardNavigationRef = useRef<boolean>(false);

    // Handle focus index when items change:
    // - If items grew (pagination), keep focus position
    // - If items shrank or stayed same (search/filter), reset to 0
    useEffect(() => {
        const prevLength = prevItemsLengthRef.current;
        const currentLength = items.length;
        prevItemsLengthRef.current = currentLength;

        // Items grew - likely pagination, keep current focus if valid
        if (currentLength > prevLength && handleFocusIndexChange) {
            setFocusedIndex((prevIndex) => {
                if (prevIndex < currentLength) {
                    return prevIndex;
                }
                return 0;
            });
        } else {
            // Items shrank or replaced - reset to start
            // that was previous implementation, and only focus to first when items changes
            setFocusedIndex(0);
        }
    }, [items, handleFocusIndexChange]);

    const virtualListKeyboardNavigationHandler = useMemo(
        () =>
            makeLinearKeyboardNavigationWithConfirm({
                onFocusNext: () => {
                    isKeyboardNavigationRef.current = true;
                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex >= items.length) {
                            return 0;
                        }
                        return nextIndex;
                    });
                },
                onFocusPrevious: () => {
                    isKeyboardNavigationRef.current = true;
                    setFocusedIndex((prevIndex) => {
                        const nextIndex = prevIndex - 1;
                        if (nextIndex < 0) {
                            return items.length - 1;
                        }
                        return nextIndex;
                    });
                },
                onFocusFirst: () => {
                    isKeyboardNavigationRef.current = true;
                    setFocusedIndex(0);
                },
                onFocusLast: () => {
                    isKeyboardNavigationRef.current = true;
                    setFocusedIndex(items.length - 1);
                },
                onSelect: () => {
                    onKeyDownSelect?.(items[focusedIndex]);
                },
                onConfirm: () => {
                    if (onKeyDownConfirm) {
                        onKeyDownConfirm(items[focusedIndex]);
                    } else {
                        // If onKeyDownConfirm is not provided, call onKeyDownSelect on Enter
                        onKeyDownSelect?.(items[focusedIndex]);
                    }
                },
                onClose: (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeDropdown?.();
                },
            }),
        [items, focusedIndex, onKeyDownSelect, onKeyDownConfirm, closeDropdown],
    );

    return {
        focusedIndex,
        onKeyboardNavigation: virtualListKeyboardNavigationHandler,
        isKeyboardNavigationRef,
    };
}

function checkIsSameScrollTarget<T>(
    prevItem: T | undefined,
    currentItem: T,
    keyExtractor?: (item: T) => string | number,
): boolean {
    if (prevItem === undefined) {
        return false;
    }
    if (keyExtractor) {
        return keyExtractor(prevItem) === keyExtractor(currentItem);
    }
    return prevItem === currentItem;
}
