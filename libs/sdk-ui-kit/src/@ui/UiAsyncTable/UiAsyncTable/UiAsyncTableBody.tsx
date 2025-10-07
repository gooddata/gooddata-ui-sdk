// (C) 2025 GoodData Corporation

import { useSkeletonItem } from "./SkeletonItemFactory.js";
import { UiPagedVirtualList } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { UiAsyncTableBodyProps } from "../types.js";

export function UiAsyncTableBody<T extends { id: string }>({
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
}: UiAsyncTableBodyProps<T>) {
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
            scrollbarHoverEffect
            scrollToIndex={scrollToIndex}
            shouldLoadNextPage={shouldLoadNextPage}
            tabIndex={items.length ? 0 : -1}
        >
            {(item) => renderItem(item)}
        </UiPagedVirtualList>
    );
}
