// (C) 2025 GoodData Corporation

import React from "react";
import { UiPagedVirtualList } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { useSkeletonItem } from "./SkeletonItemFactory.js";
import { UiAsyncTableBodyProps } from "../types.js";

export function UiAsyncTableBody<T extends { id: string }>(props: UiAsyncTableBodyProps<T>) {
    const {
        items,
        maxHeight,
        itemHeight,
        skeletonItemsCount,
        hasNextPage,
        isLoading,
        onItemClick,
        loadNextPage,
        columns,
        bulkActions,
        scrollToIndex,
        isLargeRow,
        shouldLoadNextPage,
        renderItem,
    } = props;

    const SkeletonItem = useSkeletonItem(columns, bulkActions, isLargeRow);

    return (
        <UiPagedVirtualList<T>
            maxHeight={maxHeight}
            itemHeight={itemHeight}
            itemsGap={0}
            itemPadding={0}
            items={items}
            skeletonItemsCount={skeletonItemsCount}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            onKeyDownSelect={onItemClick}
            loadNextPage={loadNextPage}
            SkeletonItem={SkeletonItem}
            scrollbarHoverEffect={true}
            scrollToIndex={scrollToIndex}
            shouldLoadNextPage={shouldLoadNextPage}
        >
            {(item) => renderItem(item)}
        </UiPagedVirtualList>
    );
}
