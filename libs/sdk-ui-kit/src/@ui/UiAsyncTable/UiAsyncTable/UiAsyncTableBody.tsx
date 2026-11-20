// (C) 2025-2026 GoodData Corporation

import {
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
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
import { e } from "../asyncTableBem.js";
import { type IUiAsyncTableBodyProps } from "../types.js";

import {
    AsyncTableGridRefProvider,
    AsyncTableHeaderNavigationProvider,
    AsyncTableInteractionProvider,
} from "./asyncTableGridContext.js";
import { useSkeletonItem } from "./SkeletonItemFactory.js";
import {
    getCellControls,
    getCellId,
    getItemKey,
    getRowId,
    getSoleCellControl,
    isFromCellControl,
    isInteractionModeCell,
} from "./utils.js";

export function UiAsyncTableBody<T extends { id: string } | { ref: ObjRef }>({
    tableId,
    hasDefaultRows,
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
    const [isGridFocused, setIsGridFocused] = useState(false);
    const hasHeader = !!header;
    const getHeaderId = useCallback((index: number) => `${tableId}-header-${index}`, [tableId]);

    const {
        handleKeyDown,
        handleFocus,
        focusRow,
        focusedRowIndex,
        focusedColumnIndex,
        focusedItemRef,
        listScrollToIndex,
    } = useAsyncTableBodyKeyboardNavigation(
        items.length,
        columns.length,
        !!bulkActions,
        scrollToIndex,
        isHeaderNavigable,
        Math.max(1, Math.floor(maxHeight / itemHeight)),
        isGridFocused,
    );

    // The grid keeps DOM focus and marks the active row virtually, so the active row's tooltip is opened
    // from here: while the grid has focus, until Escape dismisses it for that row.
    const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
    const [prevFocusedRowIndex, setPrevFocusedRowIndex] = useState(focusedRowIndex);
    const [prevFocusedColumnIndex, setPrevFocusedColumnIndex] = useState(focusedColumnIndex);
    const [isInteractionMode, setIsInteractionMode] = useState(false);
    if (prevFocusedRowIndex !== focusedRowIndex || prevFocusedColumnIndex !== focusedColumnIndex) {
        setPrevFocusedColumnIndex(focusedColumnIndex);
        setPrevFocusedRowIndex(focusedRowIndex);
        setIsTooltipDismissed(false);
        setIsInteractionMode(false);
    }

    const activeDescendantId = useMemo(() => {
        if (focusedRowIndex === -1 && isHeaderNavigable) {
            return getHeaderId(focusedColumnIndex ?? 0);
        }
        if (
            !hasDefaultRows ||
            focusedRowIndex === undefined ||
            focusedRowIndex < 0 ||
            focusedRowIndex >= items.length
        ) {
            return undefined;
        }
        const itemId = getItemKey(items[focusedRowIndex]);
        if (focusedColumnIndex !== undefined) {
            return getCellId(tableId, itemId, focusedColumnIndex);
        }
        return getRowId(tableId, itemId);
    }, [focusedRowIndex, focusedColumnIndex, items, isHeaderNavigable, getHeaderId, hasDefaultRows, tableId]);
    const [prevActiveDescendantId, setPrevActiveDescendantId] = useState(activeDescendantId);
    const [needsGridFocus, setNeedsGridFocus] = useState(false);
    if (prevActiveDescendantId !== activeDescendantId) {
        setPrevActiveDescendantId(activeDescendantId);
        if (isInteractionMode) {
            setNeedsGridFocus(true);
        }
        setIsInteractionMode(false);
    }
    const isPointerNavigationRef = useRef(false);
    useEffect(() => {
        if (!needsGridFocus) {
            return;
        }
        setNeedsGridFocus(false);
        if (isPointerNavigationRef.current) {
            isPointerNavigationRef.current = false;
            return;
        }
        const grid = gridRef.current;
        const focused = document.activeElement;
        if (grid && focused !== grid && (!focused || focused === document.body || grid.contains(focused))) {
            grid.focus({ preventScroll: true });
        }
    }, [needsGridFocus]);
    const isCellActive =
        focusedRowIndex !== undefined && focusedRowIndex >= 0 && focusedColumnIndex !== undefined;

    const isKeyboardActivationRef = useRef(false);

    const getActiveCell = useCallback(() => {
        if (!isCellActive || !activeDescendantId) {
            return null;
        }
        const cells = gridRef.current?.querySelectorAll<HTMLElement>("[role='gridcell']") ?? [];
        return Array.from(cells).find((cell) => cell.id === activeDescendantId) ?? null;
    }, [isCellActive, activeDescendantId]);

    const exitInteractionMode = useCallback(() => {
        setIsInteractionMode(false);
        gridRef.current?.focus({ preventScroll: true });
    }, []);

    const handleCellKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const cell = getActiveCell();
            if (!isInteractionMode || !cell || !cell.contains(e.target as Node) || e.defaultPrevented) {
                return;
            }
            if (e.key === "Escape" || e.key === "F2") {
                e.stopPropagation();
                if (!e.nativeEvent.isComposing) {
                    e.preventDefault();
                    exitInteractionMode();
                }
                return;
            }
            if (e.key === "Tab") {
                const controls = getCellControls(cell);
                const target = e.target as Node;
                let current = controls.indexOf(target as HTMLElement);
                for (let index = controls.length - 1; current === -1 && index >= 0; index--) {
                    if (controls[index].contains(target)) {
                        current = index;
                    }
                }
                if (current === -1) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const step = e.shiftKey ? -1 : 1;
                controls[(current + step + controls.length) % controls.length].focus();
            }
        },
        [getActiveCell, isInteractionMode, exitInteractionMode],
    );

    const handleCellActivation = useCallback(
        (e: KeyboardEvent): boolean => {
            if (e.key !== "Enter" && e.key !== "F2" && e.key !== " ") {
                return false;
            }
            const cell = getActiveCell();
            if (!cell) {
                return false;
            }
            if ((e.key === "Enter" || e.key === "F2") && isInteractionModeCell(cell)) {
                e.preventDefault();
                e.stopPropagation();
                isPointerNavigationRef.current = false;
                setIsInteractionMode(true);
                getCellControls(cell)[0].focus();
                return true;
            }
            if ((e.key === "Enter" || e.key === " ") && !focusedItemRef.current) {
                const control = getSoleCellControl(cell);
                if (control) {
                    e.preventDefault();
                    e.stopPropagation();
                    isKeyboardActivationRef.current = true;
                    try {
                        control.click();
                    } finally {
                        isKeyboardActivationRef.current = false;
                    }
                    return true;
                }
            }
            return false;
        },
        [getActiveCell, focusedItemRef],
    );
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
                handleCellKeyDown(e);
                return;
            }
            if (isTooltipOpen && e.key === "Escape") {
                // keep Escape from also closing a surrounding dialog
                e.stopPropagation();
                setIsTooltipDismissed(true);
                return;
            }
            if (handleCellActivation(e)) {
                return;
            }
            handleKeyDown(e);
        },
        [isTooltipOpen, handleKeyDown, handleCellKeyDown, handleCellActivation],
    );
    const interruptedControlRef = useRef<HTMLElement | null>(null);
    const handleGridFocus = useCallback(
        (e: FocusEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            if (!e.currentTarget.contains(target)) {
                return;
            }
            const interruptedControl = interruptedControlRef.current;
            interruptedControlRef.current = null;
            if (target === e.currentTarget) {
                setIsGridFocused(true);
                setIsInteractionMode(false);
                handleFocus(e);
                return;
            }
            if (target === interruptedControl && getActiveCell()?.contains(target)) {
                setIsGridFocused(true);
                setIsInteractionMode(true);
                return;
            }
            // Pointer clicks can focus the virtual list's containers despite tabIndex=-1, also on skeleton
            // rows and empty space. Hand that focus back to the grid; a cell control keeps its own focus,
            // and so does a layer that is only a React child (portal), as it is outside the grid's DOM.
            if (e.currentTarget.contains(target) && !target.closest("[role='row']")) {
                e.currentTarget.focus({ preventScroll: true });
            }
        },
        [handleFocus, getActiveCell],
    );
    // A clicked row becomes the active row, so keyboard work and a returning focus continue from it.
    const handleGridClick = useCallback(
        (e: MouseEvent<HTMLDivElement>) => {
            if (isKeyboardActivationRef.current) {
                return;
            }
            const activeCell = getActiveCell();
            if (isInteractionMode && activeCell && isFromCellControl(activeCell, e.target as HTMLElement)) {
                return;
            }
            const row = (e.target as HTMLElement).closest<HTMLElement>("[role='row'][aria-rowindex]");
            const rowIndex = Number(row?.getAttribute("aria-rowindex")) - 1 - (hasHeader ? 1 : 0);
            if (
                row &&
                e.currentTarget.contains(row) &&
                rowIndex >= (isHeaderNavigable ? -1 : 0) &&
                rowIndex < items.length
            ) {
                const cell = (e.target as HTMLElement).closest<HTMLElement>('[role="columnheader"]');
                const focused = document.activeElement;
                isPointerNavigationRef.current =
                    !!focused &&
                    focused !== e.currentTarget &&
                    e.currentTarget.contains(focused) &&
                    focused.contains(e.target as Node);
                focusRow(
                    rowIndex,
                    rowIndex === -1 ? Number(cell?.getAttribute("aria-colindex") ?? 1) - 1 : undefined,
                );
            }
        },
        [focusRow, items.length, hasHeader, isHeaderNavigable, isInteractionMode, getActiveCell],
    );
    const handleGridBlur = useCallback(
        (e: FocusEvent) => {
            if (!e.currentTarget.contains(e.target as Node)) {
                return;
            }
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                interruptedControlRef.current =
                    isInteractionMode && e.target !== e.currentTarget ? (e.target as HTMLElement) : null;
                setIsGridFocused(false);
                setIsInteractionMode(false);
            }
        },
        [isInteractionMode],
    );

    const interaction = useMemo(
        () => ({
            isInteractionMode,
            activeCellId: isCellActive ? activeDescendantId : undefined,
            isKeyboardActivationRef,
        }),
        [isInteractionMode, isCellActive, activeDescendantId],
    );

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
                <AsyncTableInteractionProvider value={interaction}>
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
                            scrollToIndex={listScrollToIndex}
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
                </AsyncTableInteractionProvider>
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
    isGridFocused: boolean,
) => {
    // Pending restores an active target after data changes without requesting a scroll.
    const [requestedRowIndex, setRequestedRowIndex] = useState<number | "pending" | undefined>(undefined);
    const [requestedColumnIndex, setFocusedColumnIndex] = useState<number | undefined>(undefined);
    const [previousScrollToIndex, setPreviousScrollToIndex] = useState(scrollToIndex);
    const focusedItemRef = useRef<HTMLElement | null>(null);
    const firstRow = isHeaderNavigable ? -1 : 0;
    const columnsLength = definedColumnsLength + (hasBulkActions ? 1 : 0);
    const focusedColumnIndex =
        requestedColumnIndex === undefined || columnsLength === 0
            ? undefined
            : Math.max(0, Math.min(requestedColumnIndex, columnsLength - 1));

    const lostHeader = requestedRowIndex === -1 && !isHeaderNavigable;
    const recoveryTarget = isGridFocused && requestedRowIndex !== undefined ? "pending" : undefined;
    let nextRequestedRowIndex = requestedRowIndex;
    if (previousScrollToIndex !== scrollToIndex) {
        setPreviousScrollToIndex(scrollToIndex);
        if (requestedRowIndex !== -1) nextRequestedRowIndex = recoveryTarget;
    }
    if (lostHeader) {
        nextRequestedRowIndex = recoveryTarget;
        setFocusedColumnIndex(undefined);
    } else if (typeof nextRequestedRowIndex === "number" && nextRequestedRowIndex >= rowsLength) {
        nextRequestedRowIndex = rowsLength > 0 ? rowsLength - 1 : recoveryTarget;
    }
    if (nextRequestedRowIndex === "pending" && !isGridFocused) {
        nextRequestedRowIndex = undefined;
    }
    if (nextRequestedRowIndex !== requestedRowIndex) {
        setRequestedRowIndex(nextRequestedRowIndex);
    }
    if (!lostHeader && requestedColumnIndex !== focusedColumnIndex) {
        setFocusedColumnIndex(focusedColumnIndex);
    }

    const focusedRowIndex =
        requestedRowIndex === "pending"
            ? isGridFocused && rowsLength > 0
                ? 0
                : undefined
            : requestedRowIndex;
    const listScrollToIndex =
        typeof requestedRowIndex === "number" ? Math.max(0, requestedRowIndex) : scrollToIndex;
    const horizontalRowIndex = focusedRowIndex ?? (rowsLength > 0 ? 0 : isHeaderNavigable ? -1 : "pending");

    const handleKeyDown = useMemo(
        () =>
            makeGridKeyboardNavigation({
                onFocusDown: () => {
                    const row = Math.min(rowsLength - 1, (focusedRowIndex ?? 0) + 1);
                    setRequestedRowIndex(row);
                    if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
                },
                onFocusUp: () => {
                    const row = Math.max(firstRow, (focusedRowIndex ?? 0) - 1);
                    setRequestedRowIndex(row);
                    if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
                },
                onFocusFirst: (event) => {
                    setRequestedRowIndex(event.ctrlKey ? firstRow : horizontalRowIndex);
                    setFocusedColumnIndex(0);
                },
                onFocusLast: (event) => {
                    setRequestedRowIndex(event.ctrlKey ? rowsLength - 1 : horizontalRowIndex);
                    setFocusedColumnIndex(columnsLength - 1);
                },
                onFocusLeft: () => {
                    setRequestedRowIndex(horizontalRowIndex);
                    // the first cell of a data row steps back to the whole row, which Enter opens
                    setFocusedColumnIndex(
                        horizontalRowIndex !== -1 && !focusedColumnIndex
                            ? undefined
                            : Math.max(0, (focusedColumnIndex ?? 0) - 1),
                    );
                },
                onFocusRight: () => {
                    setRequestedRowIndex(horizontalRowIndex);
                    setFocusedColumnIndex(Math.min(columnsLength - 1, (focusedColumnIndex ?? -1) + 1));
                },
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
                    setRequestedRowIndex(row);
                    if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
                },
            }),
        [
            rowsLength,
            columnsLength,
            focusedRowIndex,
            focusedColumnIndex,
            hasBulkActions,
            firstRow,
            pageSize,
            horizontalRowIndex,
        ],
    );

    const handleFocus = useCallback(
        (event: FocusEvent) => {
            if (focusedRowIndex === undefined && event.target.matches(":focus-visible")) {
                const row = rowsLength ? 0 : firstRow;
                setRequestedRowIndex(row);
                if (row === -1) setFocusedColumnIndex(focusedColumnIndex ?? 0);
            }
        },
        [focusedRowIndex, focusedColumnIndex, rowsLength, firstRow],
    );

    const focusRow = useCallback((rowIndex: number, columnIndex?: number) => {
        setRequestedRowIndex(rowIndex);
        setFocusedColumnIndex(columnIndex);
    }, []);

    return {
        handleKeyDown,
        handleFocus,
        focusRow,
        focusedRowIndex,
        focusedColumnIndex,
        focusedItemRef,
        listScrollToIndex,
    };
};
