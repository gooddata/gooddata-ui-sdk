// (C) 2025-2026 GoodData Corporation

import {
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
    type Ref,
    useCallback,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";

import { type ObjRef } from "@gooddata/sdk-model";

import { isEnterKey } from "../../../utils/events.js";
import { makeGridKeyboardNavigation } from "../../@utils/keyboardNavigation.js";
import { UiPagedVirtualList } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { e } from "../asyncTableBem.js";
import { type IUiAsyncTableBodyProps } from "../types.js";

import { AsyncTableGridRefProvider, AsyncTableHeaderNavigationProvider } from "./asyncTableGridContext.js";
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
    header,
    isHeaderNavigable,
    gridAriaLabel,
    totalItemsCount,
}: IUiAsyncTableBodyProps<T> & {
    header: ReactNode;
    isHeaderNavigable: boolean;
    gridAriaLabel?: string;
    totalItemsCount?: number;
}) {
    const SkeletonItem = useSkeletonItem(columns, bulkActions, isLargeRow ?? false);

    const gridRef = useRef<HTMLDivElement>(null);
    const tableId = useId();
    const hasHeader = !!header;
    const getHeaderId = useCallback((index: number) => `${tableId}-header-${index}`, [tableId]);

    const { handleKeyDown, handleFocus, focusRow, focusedRowIndex, focusedColumnIndex, focusedItemRef } =
        useAsyncTableBodyKeyboardNavigation(
            items.length,
            columns.length,
            !!bulkActions,
            scrollToIndex,
            isHeaderNavigable,
            Math.max(1, Math.floor(maxHeight / itemHeight)),
        );

    // The grid keeps DOM focus and marks the active row virtually, so the active row's tooltip is opened
    // from here: while the grid has focus, until Escape dismisses it for that row.
    const [isGridFocused, setIsGridFocused] = useState(false);
    const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
    const [prevFocusedRowIndex, setPrevFocusedRowIndex] = useState(focusedRowIndex);
    const [prevFocusedColumnIndex, setPrevFocusedColumnIndex] = useState(focusedColumnIndex);
    if (prevFocusedRowIndex !== focusedRowIndex || prevFocusedColumnIndex !== focusedColumnIndex) {
        setPrevFocusedColumnIndex(focusedColumnIndex);
        setPrevFocusedRowIndex(focusedRowIndex);
        setIsTooltipDismissed(false);
    }
    const focusedItem = focusedRowIndex === undefined ? undefined : items[focusedRowIndex];
    const focusedHeaderColumn = focusedRowIndex === -1 ? (focusedColumnIndex ?? 0) : undefined;
    const headerTooltip =
        focusedHeaderColumn === undefined
            ? undefined
            : columns[focusedHeaderColumn - (bulkActions ? 1 : 0)]?.headerTooltip;
    const isTooltipOpen =
        isGridFocused &&
        !isTooltipDismissed &&
        !!(headerTooltip ?? (focusedItem && getItemTooltip?.(focusedItem)));

    useEffect(() => {
        if (
            focusedRowIndex !== undefined &&
            focusedRowIndex >= 0 &&
            hasNextPage &&
            !isLoading &&
            (shouldLoadNextPage?.(focusedRowIndex, items.length) ??
                focusedRowIndex >= items.length - 1 - skeletonItemsCount)
        ) {
            loadNextPage?.();
        }
    }, [
        focusedRowIndex,
        hasNextPage,
        isLoading,
        items.length,
        loadNextPage,
        shouldLoadNextPage,
        skeletonItemsCount,
    ]);

    const handleKeyDownWithTooltip = useCallback(
        (e: KeyboardEvent) => {
            if (e.target !== e.currentTarget) {
                return;
            }
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
        (e: FocusEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            if (target === e.currentTarget) {
                setIsGridFocused(true);
                handleFocus(e);
                return;
            }
            // Pointer clicks can focus the virtual list's containers despite tabIndex=-1, also on skeleton
            // rows and empty space. Hand that focus back to the grid; a cell control keeps its own focus,
            // and so does a layer that is only a React child (portal), as it is outside the grid's DOM.
            if (e.currentTarget.contains(target) && !target.closest("[role='row']")) {
                e.currentTarget.focus({ preventScroll: true });
            }
        },
        [handleFocus],
    );
    // A clicked row becomes the active row, so keyboard work and a returning focus continue from it.
    const handleGridClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            const row = (e.target as HTMLElement).closest<HTMLElement>("[role='row'][aria-rowindex]");
            const rowIndex = Number(row?.getAttribute("aria-rowindex")) - 1 - (hasHeader ? 1 : 0);
            if (
                row &&
                e.currentTarget.contains(row) &&
                rowIndex >= (isHeaderNavigable ? -1 : 0) &&
                rowIndex < items.length
            ) {
                const cell = (e.target as HTMLElement).closest<HTMLElement>('[role="columnheader"]');
                focusRow(
                    rowIndex,
                    rowIndex === -1 ? Number(cell?.getAttribute("aria-colindex") ?? 1) - 1 : undefined,
                );
            }
        },
        [focusRow, items.length, hasHeader, isHeaderNavigable],
    );
    const handleGridBlur = useCallback((e: FocusEvent) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsGridFocused(false);
        }
    }, []);

    const activeDescendantId = useMemo(() => {
        if (focusedRowIndex === -1 && isHeaderNavigable) {
            return getHeaderId(focusedColumnIndex ?? 0);
        }
        if (focusedRowIndex === undefined || focusedRowIndex < 0 || focusedRowIndex >= items.length) {
            return undefined;
        }
        const itemId = getItemKey(items[focusedRowIndex]);
        if (focusedColumnIndex !== undefined) {
            return getCellId(itemId, focusedColumnIndex);
        }
        return getRowId(itemId);
    }, [focusedRowIndex, focusedColumnIndex, items, isHeaderNavigable, getHeaderId]);

    return (
        <AsyncTableGridRefProvider value={gridRef}>
            <AsyncTableHeaderNavigationProvider
                value={{
                    focusedColumnIndex: focusedHeaderColumn,
                    focusedElementRef: focusedItemRef,
                    isTooltipOpen,
                    getHeaderId,
                }}
            >
                <div
                    className={e("grid")}
                    role="grid"
                    ref={gridRef}
                    aria-label={gridAriaLabel}
                    aria-rowcount={
                        totalItemsCount === undefined ? undefined : totalItemsCount + (hasHeader ? 1 : 0)
                    }
                    aria-colcount={columns.length + (bulkActions ? 1 : 0)}
                    tabIndex={items.length || isHeaderNavigable ? 0 : -1}
                    aria-activedescendant={activeDescendantId}
                    onKeyDown={handleKeyDownWithTooltip}
                    onFocus={handleGridFocus}
                    onBlur={handleGridBlur}
                    onClick={handleGridClick}
                >
                    {header}
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
                        scrollToIndex={focusedRowIndex === -1 ? 0 : (focusedRowIndex ?? scrollToIndex)}
                        shouldLoadNextPage={shouldLoadNextPage}
                        tabIndex={-1}
                        focusedItem={focusedItem}
                        representAs="grid"
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
                </div>
            </AsyncTableHeaderNavigationProvider>
        </AsyncTableGridRefProvider>
    );
}

const useAsyncTableBodyKeyboardNavigation = (
    rowsLength: number,
    definedColumnsLength: number,
    hasBulkActions: boolean,
    scrollToIndex: number | undefined,
    isHeaderNavigable: boolean,
    pageSize: number,
) => {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number | undefined>(undefined);
    const [focusedColumnIndex, setFocusedColumnIndex] = useState<number | undefined>(undefined);
    const focusedItemRef = useRef<HTMLElement | null>(null);
    const firstRow = isHeaderNavigable ? -1 : 0;
    const columnsLength = definedColumnsLength + (hasBulkActions ? 1 : 0);

    // A new scroll target means new data rows. The header stays, as sorting from it resets the target too.
    useEffect(() => {
        setFocusedRowIndex((index) => (index === -1 ? index : undefined));
    }, [scrollToIndex]);

    useEffect(() => {
        setFocusedRowIndex((index) =>
            index !== undefined && index >= rowsLength
                ? rowsLength > 0
                    ? rowsLength - 1
                    : undefined
                : index,
        );
    }, [rowsLength]);

    const handleKeyDown = useMemo(
        () =>
            makeGridKeyboardNavigation({
                onFocusDown: () => setFocusedRowIndex(Math.min(rowsLength - 1, (focusedRowIndex ?? 0) + 1)),
                onFocusUp: () => {
                    const row = Math.max(firstRow, (focusedRowIndex ?? 0) - 1);
                    setFocusedRowIndex(row);
                    if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
                },
                onFocusFirst: (event) => {
                    if (event.ctrlKey) setFocusedRowIndex(firstRow);
                    setFocusedColumnIndex(0);
                },
                onFocusLast: (event) => {
                    if (event.ctrlKey) setFocusedRowIndex(rowsLength - 1);
                    setFocusedColumnIndex(columnsLength - 1);
                },
                onFocusLeft: () =>
                    // the first cell of a data row steps back to the whole row, which Enter opens
                    setFocusedColumnIndex(
                        focusedRowIndex !== -1 && !focusedColumnIndex
                            ? undefined
                            : Math.max(0, (focusedColumnIndex ?? 0) - 1),
                    ),
                onFocusRight: () =>
                    setFocusedColumnIndex(Math.min(columnsLength - 1, (focusedColumnIndex ?? -1) + 1)),
                onSelect: (event) => {
                    if (
                        isEnterKey(event) &&
                        focusedRowIndex !== -1 &&
                        focusedColumnIndex === 0 &&
                        hasBulkActions
                    )
                        return;
                    focusedItemRef.current?.click();
                },
                onUnhandledKeyDown: (event) => {
                    if (event.key !== "PageDown" && event.key !== "PageUp") return;
                    event.preventDefault();
                    event.stopPropagation();
                    const step = event.key === "PageDown" ? pageSize : -pageSize;
                    const row = Math.max(firstRow, Math.min(rowsLength - 1, (focusedRowIndex ?? 0) + step));
                    setFocusedRowIndex(row);
                    if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
                },
            }),
        [rowsLength, columnsLength, focusedRowIndex, focusedColumnIndex, hasBulkActions, firstRow, pageSize],
    );

    const handleFocus = useCallback(
        (event: FocusEvent) => {
            if (focusedRowIndex === undefined && event.target.matches(":focus-visible")) {
                const row = rowsLength ? 0 : firstRow;
                setFocusedRowIndex(row);
                if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
            }
        },
        [focusedRowIndex, focusedColumnIndex, rowsLength, firstRow],
    );

    const focusRow = useCallback((rowIndex: number, columnIndex?: number) => {
        setFocusedRowIndex(rowIndex);
        setFocusedColumnIndex(columnIndex);
    }, []);

    return { handleKeyDown, handleFocus, focusRow, focusedRowIndex, focusedColumnIndex, focusedItemRef };
};
