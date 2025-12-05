// (C) 2024-2025 GoodData Corporation

import {
    CSSProperties,
    ComponentType,
    KeyboardEvent,
    ReactNode,
    Ref,
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
    SkeletonItem?: ComponentType<UiPagedVirtualListSkeletonItemProps>;
    representAs?: "grid" | "listbox";
    listboxProps?: Record<string, any>;
    // keyboard and focus management
    tabIndex?: number; // tabindex=-1 means that keyboard navigation and focus are handled by the parent
    focusedItem?: T;
    focusedAction?: string;
    getIsItemSelected?: (item: T) => boolean;
}

/**
 * @internal
 */
export interface IUiPagedVirtualListImperativeHandle<T> {
    scrollToItem: (item: T) => void;
}

function UiPagedVirtualListNotWrapped<T>(
    props: UiPagedVirtualListProps<T>,
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
    } = props;

    const { itemsCount, scrollContainerRef, height, hasScroll, rowVirtualizer, virtualItems } =
        useVirtualList(props);

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
    const { focusedIndex, onKeyboardNavigation } = useVirtualListKeyboardNavigation(
        items ?? [],
        onKeyDownSelect,
        onKeyDownConfirm,
        closeDropdown,
    );
    const ListElement = representAs === "grid" ? "div" : "ul";
    const ItemElement = representAs === "grid" ? "div" : "li";
    const makeId = ScopedIdStore.useContextStoreOptional((ctx) => ctx.makeId);
    const focusedItemIndex = focusedItem ? items?.indexOf(focusedItem) : 0;
    const finalFocusedIndex = focusedItem ? focusedItemIndex : focusedIndex;

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
                    {...listboxProps}
                >
                    {virtualItems.map((virtualRow) => {
                        const item = items?.[virtualRow.index];
                        const isSkeletonItem = virtualRow.index > itemsCount - 1;

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
                                      "aria-selected": getIsItemSelected
                                          ? getIsItemSelected(item!)
                                          : undefined,
                                      "aria-posinset": virtualRow.index + 1,
                                      "aria-setsize": items?.length ?? 0,
                                      tabIndex:
                                          focusedItem === item && focusedAction === SELECT_ITEM_ACTION
                                              ? 0
                                              : -1,
                                      id: makeId?.({ item: item!, specifier: SELECT_ITEM_ACTION }),
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
                                    <SkeletonItem key={virtualRow.index} itemHeight={itemHeight} />
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
}: UiPagedVirtualListProps<T>) {
    const defaultShouldLoadNextPage = useCallback(
        (lastItemIndex: number, itemsCount: number, skeletonItemsCount: number) =>
            lastItemIndex >= itemsCount - 1 - skeletonItemsCount,
        [],
    );

    const shouldLoadNextPage = useMemo(() => {
        return shouldLoadNextPageProps ?? defaultShouldLoadNextPage;
    }, [shouldLoadNextPageProps, defaultShouldLoadNextPage]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

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

    const height = Math.min(maxHeight, realHeight) + containerPadding;

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
    onKeyDownConfirm?: (item: T) => void,
    closeDropdown?: () => void,
) {
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    useEffect(() => {
        setFocusedIndex(0);
    }, [items]);

    const virtualListKeyboardNavigationHandler = useMemo(
        () =>
            makeLinearKeyboardNavigationWithConfirm({
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
    };
}
