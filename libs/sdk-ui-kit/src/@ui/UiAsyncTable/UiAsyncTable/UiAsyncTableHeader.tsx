// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { UiAsyncTableCheckbox } from "./UiAsyncTableCheckbox.js";
import { getColumnHeaderId, getColumnWidth } from "./utils.js";
import { makeTabsKeyboardNavigation } from "../../@utils/keyboardNavigation.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { e } from "../asyncTableBem.js";
import { UiAsyncTableColumn, UiAsyncTableHeaderProps } from "../types.js";

const arrowIcon = <UiIcon type="dropDown" size={11} color="complementary-6" />;

export function UiAsyncTableHeader<T>({
    columns,
    handleColumnClick,
    sortBy,
    sortDirection,
    hasCheckbox,
    width,
    small,
    largeRow,
    accessibilityConfig,
}: UiAsyncTableHeaderProps<T>) {
    const { handleKeyDown, isFocused } = useHeaderKeyboardNavigation(columns, handleColumnClick);

    return (
        <div
            tabIndex={0}
            className={e("header", { small })}
            role="row"
            onKeyDown={handleKeyDown}
            style={{ width }}
        >
            {hasCheckbox ? (
                <UiAsyncTableCheckbox ariaLabel={accessibilityConfig?.checkboxAllAriaLabel} />
            ) : null}
            {columns.map((column, index) => {
                const width = getColumnWidth(!!column.renderMenu, largeRow, column.width);
                const sorted = sortBy && sortBy === column.key;
                const desc = sorted && sortDirection === "desc";
                const { sortable } = column;
                return (
                    <div
                        key={index}
                        onClick={() => sortable && handleColumnClick(column.key)}
                        className={e("cell", {
                            sorted,
                            desc,
                            sortable,
                            isFocused: isFocused(index),
                            align: column.align,
                        })}
                        style={{ width }}
                        role="columnheader"
                        id={getColumnHeaderId(String(column.key ?? index))}
                        aria-sort={sorted ? (desc ? "descending" : "ascending") : "none"}
                    >
                        <span className={e("text")}>{column.label}</span>
                        {sortable ? <div className={e("sort")}>{arrowIcon}</div> : null}
                    </div>
                );
            })}
        </div>
    );
}

function useHeaderKeyboardNavigation<T>(
    columns: Array<UiAsyncTableColumn<T>>,
    handleColumnClick: (key?: keyof T) => void,
) {
    const [focusedIndexPosition, setFocusedIndexPosition] = useState(0);

    useEffect(() => {
        setFocusedIndexPosition(0);
    }, [columns]);

    const focusableIndexes = useMemo(
        () => columns.map((_, index) => index).filter((index) => columns[index].sortable),
        [columns],
    );

    const handleKeyDown = useMemo(() => {
        return makeTabsKeyboardNavigation({
            onSelect: () => {
                if (columns[focusableIndexes[focusedIndexPosition]].sortable) {
                    handleColumnClick(columns[focusableIndexes[focusedIndexPosition]].key);
                }
            },
            onFocusNext: () => {
                setFocusedIndexPosition(
                    focusedIndexPosition >= focusableIndexes.length - 1 ? 0 : focusedIndexPosition + 1,
                );
            },
            onFocusPrevious: () => {
                setFocusedIndexPosition(
                    focusedIndexPosition <= 0 ? focusableIndexes.length - 1 : focusedIndexPosition - 1,
                );
            },
            onFocusFirst: () => {
                setFocusedIndexPosition(0);
            },
            onFocusLast: () => {
                setFocusedIndexPosition(focusableIndexes.length - 1);
            },
        });
    }, [handleColumnClick, focusedIndexPosition, setFocusedIndexPosition, focusableIndexes, columns]);

    const isFocused = useCallback(
        (index: number) => {
            return focusableIndexes[focusedIndexPosition] === index;
        },
        [focusableIndexes, focusedIndexPosition],
    );

    return {
        handleKeyDown,
        isFocused,
    };
}
