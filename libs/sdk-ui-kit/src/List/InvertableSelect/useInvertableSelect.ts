// (C) 2007-2023 GoodData Corporation
import { useMemo, useCallback } from "react";
import differenceBy from "lodash/differenceBy.js";
import intersectionBy from "lodash/intersectionBy.js";
import keyBy from "lodash/keyBy.js";
import noop from "lodash/noop.js";

/**
 * @internal
 */
export interface IUseInvertableSelectProps<T> {
    items: T[];
    totalItemsCount?: number;
    getItemKey?: (item: T) => string;

    searchString?: string;

    isInverted: boolean;
    selectedItems: T[];
    onSelect?: (items: T[], isInverted: boolean) => void;
}

export type SelectionStatusType = "all" | "partial" | "none";

/**
 * @internal
 */
export function useInvertableSelect<T>(props: IUseInvertableSelectProps<T>) {
    const {
        items,
        totalItemsCount,
        getItemKey,

        searchString,

        isInverted = true,
        selectedItems,
        onSelect = noop,
    } = props;

    const isSearch = searchString.length > 0;
    const isSelectionEmpty = selectedItems.length === 0;

    const selectionMap = useMemo(() => {
        return keyBy(selectedItems, getItemKey);
    }, [selectedItems, getItemKey]);

    const itemsNotInSelection = useMemo(
        () => differenceBy(items, selectedItems, getItemKey),
        [items, selectedItems, getItemKey],
    );
    const itemsInSelection = useMemo(
        () => intersectionBy(items, selectedItems, getItemKey),
        [items, selectedItems, getItemKey],
    );

    const loadedSelectedItems = useMemo(
        // For inverted list, items are selected when they are not in the selection
        () => (isInverted ? itemsNotInSelection : itemsInSelection),
        [isInverted, itemsNotInSelection, itemsInSelection],
    );

    const loadedUnselectedItems = useMemo(
        // For inverted list, items are unselected when they are in the selection
        () => (isInverted ? itemsInSelection : itemsNotInSelection),
        [isInverted, itemsNotInSelection, itemsInSelection],
    );

    const selectionState: SelectionStatusType = useMemo(() => {
        if (!isSearch) {
            // Negative filter with no selection
            if (isInverted && isSelectionEmpty) {
                return "all";
            }

            // Positive filter with all items selected
            if (!isInverted && loadedSelectedItems.length === totalItemsCount) {
                return "all";
            }

            // Positive filter with no selection
            if (!isInverted && isSelectionEmpty) {
                return "none";
            }

            // Negative filter with all items selected
            if (isInverted && loadedUnselectedItems.length === totalItemsCount) {
                return "none";
            }
        } else {
            if (isInverted && itemsInSelection.length === 0) {
                return "all";
            }

            if (!isInverted && itemsInSelection.length === totalItemsCount) {
                return "all";
            }

            if (isInverted && itemsInSelection.length === totalItemsCount) {
                return "none";
            }

            if (!isInverted && itemsInSelection.length === 0) {
                return "none";
            }
        }

        return "partial";
    }, [
        isInverted,
        isSelectionEmpty,
        totalItemsCount,
        loadedSelectedItems,
        isSearch,
        loadedUnselectedItems,
        itemsInSelection.length,
    ]);

    const getIsItemSelected = useCallback(
        (item: T) => {
            const itemKey = getItemKey(item);
            return isInverted ? !selectionMap[itemKey] : !!selectionMap[itemKey];
        },
        [isInverted, selectionMap, getItemKey],
    );

    const selectAll = useCallback(() => {
        onSelect([], true);
    }, [onSelect]);

    const selectNone = useCallback(() => {
        onSelect([], false);
    }, [onSelect]);

    const selectOnly = useCallback(
        (item: T) => {
            onSelect([item], false);
        },
        [onSelect],
    );

    const selectItems = useCallback(
        (items: T[]) => {
            const newItems = isInverted
                ? differenceBy(selectedItems, items, getItemKey)
                : selectedItems.concat(items);

            if (!isSearch && !isInverted && newItems.length === totalItemsCount) {
                // Selecting last item -> select all
                selectAll();
            } else {
                onSelect(newItems, isInverted);
            }
        },
        [isInverted, selectedItems, onSelect, selectAll, getItemKey, totalItemsCount, isSearch],
    );

    const deselectItems = useCallback(
        (items: T[]) => {
            const newItems = isInverted
                ? selectedItems.concat(items)
                : differenceBy(selectedItems, items, getItemKey);

            if (!isSearch && isInverted && newItems.length === totalItemsCount) {
                selectNone();
            } else {
                onSelect(newItems, isInverted);
            }
        },
        [isInverted, selectedItems, onSelect, selectNone, getItemKey, totalItemsCount, isSearch],
    );

    const onSelectAllCheckboxToggle = useCallback(() => {
        if (isSearch) {
            if (selectionState === "all" || loadedSelectedItems.length === items.length) {
                // Reduce selection, if is all, or all loaded is selected
                deselectItems(loadedSelectedItems);
            } else {
                // Extend selection if is none or partial
                selectItems(loadedUnselectedItems);
            }
        } else if (selectionState === "all") {
            // Is all -> select none
            selectNone();
        } else {
            // Is partial or none -> select all
            selectAll();
        }
    }, [
        items,
        selectionState,
        loadedUnselectedItems,
        loadedSelectedItems,
        selectItems,
        deselectItems,
        selectAll,
        selectNone,
        isSearch,
    ]);

    const onSelectAllCheckboxChange = useCallback(
        (value: boolean) => {
            if (isSearch) {
                if (value) {
                    selectItems(loadedUnselectedItems);
                } else {
                    deselectItems(loadedSelectedItems);
                }
            } else if (value) {
                selectAll();
            } else {
                selectNone();
            }
        },
        [
            loadedUnselectedItems,
            loadedSelectedItems,
            selectItems,
            deselectItems,
            selectAll,
            selectNone,
            isSearch,
        ],
    );

    return {
        onSelectAllCheckboxToggle,
        onSelectAllCheckboxChange,
        getIsItemSelected,
        selectionState,
        selectItems,
        deselectItems,
        selectOnly,
    };
}
