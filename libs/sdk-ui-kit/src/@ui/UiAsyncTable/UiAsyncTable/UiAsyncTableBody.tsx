// (C) 2025-2026 GoodData Corporation

import {
    type FocusEvent,
    type KeyboardEvent,
    type Ref,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import { isEnterKey } from "../../../utils/events.js";
import { makeGridKeyboardNavigation } from "../../@utils/keyboardNavigation.js";
import { UiPagedVirtualList } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { type IUiAsyncTableBodyProps } from "../types.js";

import { AsyncTableGridRefProvider } from "./asyncTableGridContext.js";
import { useSkeletonItem } from "./SkeletonItemFactory.js";
import { getCellId, getItemKey, getRowId } from "./utils.js";

export function UiAsyncTableBody<T extends { id: string } | { ref: ObjRef }>({
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
    getItemTooltip,
    renderItem,
}: IUiAsyncTableBodyProps<T>) {
    const SkeletonItem = useSkeletonItem(columns, bulkActions, isLargeRow ?? false);

    const gridRef = useRef<HTMLElement>(null);

    const { handleKeyDown, handleFocus, focusedRowIndex, focusedColumnIndex, focusedItemRef } =
        useAsyncTableBodyKeyboardNavigation(items.length, columns.length, !!bulkActions, scrollToIndex);

    // The grid keeps DOM focus and marks the active row virtually, so the active row's tooltip is opened
    // from here: while the grid has focus, until Escape dismisses it for that row.
    const [isGridFocused, setIsGridFocused] = useState(false);
    const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
    const [prevFocusedRowIndex, setPrevFocusedRowIndex] = useState(focusedRowIndex);
    if (prevFocusedRowIndex !== focusedRowIndex) {
        setPrevFocusedRowIndex(focusedRowIndex);
        setIsTooltipDismissed(false);
    }
    const focusedItem = focusedRowIndex === undefined ? undefined : items[focusedRowIndex];
    const isTooltipOpen =
        isGridFocused && !isTooltipDismissed && !!focusedItem && !!getItemTooltip?.(focusedItem);

    const handleKeyDownWithTooltip = useCallback(
        (e: KeyboardEvent) => {
            if (isTooltipOpen && e.key === "Escape") {
                // keep Escape from also closing a surrounding dialog
                e.stopPropagation();
                setIsTooltipDismissed(true);
                return;
            }
            handleKeyDown(e);
        },
        [isTooltipOpen, handleKeyDown],
    );
    const handleGridFocus = useCallback(
        (e: FocusEvent) => {
            setIsGridFocused(true);
            handleFocus(e);
        },
        [handleFocus],
    );
    const handleGridBlur = useCallback((e: FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsGridFocused(false);
        }
    }, []);

    const activeDescendantId = useMemo(() => {
        if (focusedRowIndex === undefined || focusedRowIndex < 0 || focusedRowIndex >= items.length) {
            return undefined;
        }
        const itemId = getItemKey(items[focusedRowIndex]);
        if (focusedColumnIndex !== undefined) {
            return getCellId(itemId, focusedColumnIndex);
        }
        return getRowId(itemId);
    }, [focusedRowIndex, focusedColumnIndex, items]);

    return (
        <AsyncTableGridRefProvider value={gridRef}>
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
                customKeyboardNavigationHandler={handleKeyDownWithTooltip}
                onFocus={handleGridFocus}
                listboxProps={{
                    "aria-activedescendant": activeDescendantId,
                    ref: gridRef,
                    onBlur: handleGridBlur,
                }}
            >
                {(item: T, focusedIndex?: number) => {
                    const itemIndex = focusedIndex ?? 0;
                    return renderItem(
                        item,
                        itemIndex,
                        focusedItemRef as Ref<HTMLElement>,
                        itemIndex === focusedRowIndex,
                        focusedColumnIndex,
                        itemIndex === focusedRowIndex && isTooltipOpen,
                    );
                }}
            </UiPagedVirtualList>
        </AsyncTableGridRefProvider>
    );
}

const useAsyncTableBodyKeyboardNavigation = (
    rowsLength: number,
    definedColumnsLength: number,
    hasBulkActions: boolean,
    scrollToIndex: number | undefined,
) => {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number | undefined>(undefined);
    const [focusedColumnIndex, setFocusedColumnIndex] = useState<number | undefined>(undefined);

    const focusedItemRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setFocusedRowIndex(undefined);
    }, [scrollToIndex]);

    const columnsLength = useMemo(() => {
        return definedColumnsLength + (hasBulkActions ? 1 : 0);
    }, [definedColumnsLength, hasBulkActions]);

    const isFirstRow = useMemo(() => {
        return focusedRowIndex === undefined || focusedRowIndex === 0;
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
                setFocusedRowIndex(isLastRow ? 0 : (focusedRowIndex ?? 0) + 1);
            },
            onFocusUp: () => {
                setFocusedRowIndex(isFirstRow ? rowsLength - 1 : (focusedRowIndex ?? 0) - 1);
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

    const handleFocus = useCallback(
        (e: FocusEvent) => {
            if (focusedRowIndex === undefined && e.target.matches(":focus-visible")) {
                setFocusedRowIndex(0);
            }
        },
        [focusedRowIndex],
    );

    return {
        handleKeyDown,
        handleFocus,
        focusedRowIndex,
        focusedColumnIndex,
        focusedItemRef,
    };
};
