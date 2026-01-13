// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { getColumnHeaderId, getColumnWidth } from "./utils.js";
import { makeTabsKeyboardNavigation } from "../../@utils/keyboardNavigation.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { type UiAsyncTableColumn, type UiAsyncTableHeaderProps } from "../types.js";

const arrowIcon = <UiIcon ariaHidden type="dropDown" size={11} color="complementary-6" />;

export function UiAsyncTableHeader<T>({
    columns,
    handleColumnClick,
    sortBy,
    sortDirection,
    hasCheckbox,
    width,
    small,
    largeRow,
}: UiAsyncTableHeaderProps<T>) {
    const { handleKeyDown, isFocused, isFocusable } = useHeaderKeyboardNavigation(columns, handleColumnClick);
    const intl = useIntl();

    return (
        <div
            tabIndex={isFocusable ? 0 : undefined}
            className={e("header", { small: small ?? false })}
            role="row"
            aria-label={intl.formatMessage(messages["headerAriaLabel"])}
            onKeyDown={handleKeyDown}
            style={{ width }}
        >
            {hasCheckbox ? (
                <div
                    className={e("cell", { checkbox: true })}
                    role="columnheader"
                    id={getColumnHeaderId("checkbox")}
                    aria-label={intl.formatMessage(messages["checkboxHeaderAriaLabel"])}
                    aria-sort="none"
                />
            ) : null}

            {columns.map((column, index) => {
                const width = getColumnWidth(!!column.renderMenu, largeRow ?? false, column.width);
                const sorted = sortBy && sortBy === column.key;
                const desc = sorted && sortDirection === "desc";
                const { sortable, renderMenu } = column;
                return (
                    <div
                        key={index}
                        onClick={() => sortable && handleColumnClick(column.key)}
                        className={e("cell", {
                            sorted: sorted ?? false,
                            desc: desc ?? false,
                            sortable: sortable ?? false,
                            isFocused: isFocused(index),
                            align: column.align ?? false,
                        })}
                        style={{ width }}
                        role="columnheader"
                        id={getColumnHeaderId(String(column.key ?? index))}
                        aria-sort={sorted ? (desc ? "descending" : "ascending") : "none"}
                        aria-label={
                            renderMenu ? intl.formatMessage(messages["menuHeaderAriaLabel"]) : column.label
                        }
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
    const isFocusable = focusableIndexes.length > 0;

    const handleKeyDown = useMemo(() => {
        if (!isFocusable) {
            return undefined;
        }
        return makeTabsKeyboardNavigation({
            onSelect: () => {
                const focusedColumnIndex = focusableIndexes[focusedIndexPosition];
                if (focusedColumnIndex === undefined) {
                    return;
                }
                const focusedColumn = columns[focusedColumnIndex];
                if (focusedColumn?.sortable) {
                    handleColumnClick(focusedColumn.key);
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
    }, [
        handleColumnClick,
        focusedIndexPosition,
        setFocusedIndexPosition,
        focusableIndexes,
        columns,
        isFocusable,
    ]);

    const isFocused = useCallback(
        (index: number) => {
            if (!isFocusable) {
                return false;
            }
            return focusableIndexes[focusedIndexPosition] === index;
        },
        [focusableIndexes, focusedIndexPosition, isFocusable],
    );

    return {
        handleKeyDown,
        isFocused,
        isFocusable,
    };
}
