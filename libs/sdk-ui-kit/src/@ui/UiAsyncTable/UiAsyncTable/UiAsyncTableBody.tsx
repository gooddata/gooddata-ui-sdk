// (C) 2025-2026 GoodData Corporation

import { type Ref, useEffect, useMemo, useRef, useState } from "react";

import { useSkeletonItem } from "./SkeletonItemFactory.js";
import { isEnterKey } from "../../../utils/events.js";
import { makeGridKeyboardNavigation } from "../../@utils/keyboardNavigation.js";
import { UiPagedVirtualList } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { type IUiAsyncTableBodyProps } from "../types.js";

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
}: IUiAsyncTableBodyProps<T>) {
    const SkeletonItem = useSkeletonItem(columns, bulkActions, isLargeRow ?? false);

    const { handleKeyDown, focusedRowIndex, focusedColumnIndex, focusedItemRef } =
        useAsyncTableBodyKeyboardNavigation(items.length, columns.length, !!bulkActions, scrollToIndex);

    return (
        <UiPagedVirtualList
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
            scrollToIndex={scrollToIndex ?? focusedRowIndex}
            shouldLoadNextPage={shouldLoadNextPage}
            tabIndex={items.length ? 0 : -1}
            customKeyboardNavigationHandler={handleKeyDown}
        >
            {(item: T, focusedIndex?: number) => {
                const itemIndex = focusedIndex ?? 0;
                return renderItem(
                    item,
                    itemIndex,
                    focusedItemRef as Ref<HTMLElement>,
                    itemIndex === focusedRowIndex,
                    focusedColumnIndex,
                );
            }}
        </UiPagedVirtualList>
    );
}

const useAsyncTableBodyKeyboardNavigation = (
    rowsLength: number,
    definedColumnsLength: number,
    hasBulkActions: boolean,
    scrollToIndex: number | undefined,
) => {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number>(0);
    const [focusedColumnIndex, setFocusedColumnIndex] = useState<number | undefined>(undefined);

    const focusedItemRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (scrollToIndex !== undefined) {
            setFocusedRowIndex(scrollToIndex);
        }
    }, [scrollToIndex]);

    const columnsLength = useMemo(() => {
        return definedColumnsLength + (hasBulkActions ? 1 : 0);
    }, [definedColumnsLength, hasBulkActions]);

    const isFirstRow = useMemo(() => {
        return focusedRowIndex === 0;
    }, [focusedRowIndex]);

    const isLastRow = useMemo(() => {
        return focusedRowIndex === rowsLength - 1;
    }, [focusedRowIndex, rowsLength]);

    const isFirstColumn = useMemo(() => {
        return focusedColumnIndex === 0;
    }, [focusedColumnIndex]);

    const isLastColumn = useMemo(() => {
        return focusedColumnIndex === columnsLength - 1;
    }, [focusedColumnIndex, columnsLength]);

    const handleKeyDown = useMemo(() => {
        return makeGridKeyboardNavigation({
            onFocusDown: () => {
                setFocusedRowIndex(isLastRow ? 0 : focusedRowIndex + 1);
            },
            onFocusUp: () => {
                setFocusedRowIndex(isFirstRow ? rowsLength - 1 : focusedRowIndex - 1);
            },
            onFocusFirst: () => {
                setFocusedRowIndex(0);
            },
            onFocusLast: () => {
                setFocusedRowIndex(rowsLength - 1);
            },
            onFocusLeft: () => {
                if (focusedColumnIndex === undefined) {
                    setFocusedColumnIndex(columnsLength - 1);
                    return;
                }
                setFocusedColumnIndex(isFirstColumn ? undefined : focusedColumnIndex - 1);
            },
            onFocusRight: () => {
                if (focusedColumnIndex === undefined) {
                    setFocusedColumnIndex(0);
                    return;
                }
                setFocusedColumnIndex(isLastColumn ? undefined : focusedColumnIndex + 1);
            },
            onSelect: (e) => {
                const isCheckbox = focusedColumnIndex === 0 && hasBulkActions;
                if (isEnterKey(e) && isCheckbox) {
                    return;
                }
                focusedItemRef.current?.click();
            },
        });
    }, [
        rowsLength,
        columnsLength,
        focusedRowIndex,
        setFocusedRowIndex,
        focusedColumnIndex,
        setFocusedColumnIndex,
        hasBulkActions,
        isFirstRow,
        isLastRow,
        isFirstColumn,
        isLastColumn,
    ]);

    return {
        handleKeyDown,
        focusedRowIndex,
        focusedColumnIndex,
        focusedItemRef,
    };
};
