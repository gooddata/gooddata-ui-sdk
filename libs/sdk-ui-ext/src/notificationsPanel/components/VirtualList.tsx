// (C) 2024 GoodData Corporation

import React, { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Skeleton } from "./Skeleton.js";
import { bem } from "../bem.js";

export interface IPagedVirtualListProps<T> {
    maxHeight: number;
    items?: T[];
    itemHeight: number;
    itemsGap: number;
    itemPadding: number;
    skeletonItemsCount: number;
    hasNextPage?: boolean;
    loadNextPage?: () => void;
    isLoading?: boolean;
    children: (item: T) => React.ReactNode;
}

const { b, e } = bem("gd-ui-ext-virtual-list");

export function PagedVirtualList<T>(props: IPagedVirtualListProps<T>) {
    const { items, itemHeight, itemsGap, itemPadding, children } = props;

    const { itemsCount, scrollContainerRef, height, hasScroll, rowVirtualizer, virtualItems } =
        useVirtualList(props);

    return (
        <div
            className={b({
                hasScroll,
            })}
        >
            <div
                ref={scrollContainerRef}
                className={e("scroll-container")}
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
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: `calc(100% + ${hasScroll ? "10px" : "0px"})`,
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                            paddingRight: itemPadding,
                            paddingLeft: itemPadding,
                        };

                        return (
                            <div key={virtualRow.index} style={style}>
                                {isSkeletonItem ? (
                                    <Skeleton itemHeight={itemHeight} key={virtualRow.index} />
                                ) : (
                                    children(item!)
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function useVirtualList<T>(props: IPagedVirtualListProps<T>) {
    const {
        items,
        itemHeight,
        itemsGap,
        skeletonItemsCount,
        hasNextPage,
        loadNextPage,
        isLoading,
        maxHeight,
    } = props;

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const itemsCount = items ? items.length : 0;

    let renderItemsCount = itemsCount;
    if (hasNextPage) {
        renderItemsCount = itemsCount + skeletonItemsCount;
    } else if (itemsCount === 0 && isLoading) {
        renderItemsCount = skeletonItemsCount;
    }

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

        if (lastItem.index >= itemsCount - 1 - skeletonItemsCount && hasNextPage && !isLoading) {
            loadNextPage?.();
        }
    }, [hasNextPage, loadNextPage, itemsCount, isLoading, virtualItems, skeletonItemsCount]);

    return {
        itemsCount,
        scrollContainerRef,
        height,
        hasScroll,
        rowVirtualizer,
        virtualItems,
    };
}
