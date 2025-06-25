// (C) 2025 GoodData Corporation

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { IAsyncTableHeaderProps, IColumn } from "./types.js";
import { e } from "./asyncTableBem.js";
import { UiIcon } from "../../@ui/UiIcon/UiIcon.js";
import { AsyncTableCheckbox } from "./AsyncTableCheckbox.js";
import { makeTabsKeyboardNavigation } from "../../@ui/@utils/keyboardNavigation.js";
import { getColumnWidth } from "./utils.js";

const arrowIcon = <UiIcon type="dropDown" size={14} color="complementary-6" />;

export function AsyncTableHeader<T>({
    columns,
    handleColumnClick,
    sortBy,
    sortDirection,
    hasCheckbox,
    width,
    small,
    largeRow,
}: IAsyncTableHeaderProps<T>) {
    const { handleKeyDown, isFocused } = useHeaderKeyboardNavigation(columns, handleColumnClick);

    return (
        <div
            tabIndex={0}
            className={e("header", { small })}
            role="row"
            onKeyDown={handleKeyDown}
            style={{ width }}
        >
            {hasCheckbox ? <AsyncTableCheckbox /> : null}
            {columns.map((column, index) => {
                const width = getColumnWidth(!!column.renderMenu, largeRow, column.width);
                const sorted = sortBy && sortBy === column.key;
                const desc = sorted && sortDirection === "desc";
                const { sortable } = column;
                return (
                    <div
                        key={index}
                        onClick={() => sortable && handleColumnClick(column.key)}
                        className={e("cell", { sorted, desc, sortable, isFocused: isFocused(index) })}
                        style={{ width }}
                        role="columnheader"
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
    columns: Array<IColumn<T>>,
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
