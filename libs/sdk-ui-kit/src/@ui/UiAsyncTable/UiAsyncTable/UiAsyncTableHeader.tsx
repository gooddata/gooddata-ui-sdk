// (C) 2025-2026 GoodData Corporation

import { type FocusEvent, type KeyboardEvent, useCallback, useEffect, useId, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import { makeTabsKeyboardNavigation } from "../../@utils/keyboardNavigation.js";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { UiTooltip } from "../../UiTooltip/UiTooltip.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { type IUiAsyncTableColumn, type IUiAsyncTableHeaderProps } from "../types.js";

import { getColumnHeaderId, getColumnWidth } from "./utils.js";

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
}: IUiAsyncTableHeaderProps<T>) {
    const { handleKeyDown, isFocused, isFocusable } = useHeaderKeyboardNavigation(columns, handleColumnClick);
    const hasFocusedTooltip = columns.some((column, index) => isFocused(index) && !!column.headerTooltip);
    const { isKeyboardActive, onHeaderKeyDown, onHeaderFocus, onHeaderBlur } = useHeaderKeyboardActivity(
        handleKeyDown,
        hasFocusedTooltip,
    );
    const intl = useIntl();
    const tableId = useId();
    const columnHeaderId = (column: IUiAsyncTableColumn<T>, index: number) =>
        `${getColumnHeaderId(String(column.key ?? index))}-${tableId}`;
    const focusedIndex = columns.findIndex((_, index) => isFocused(index));
    const activeHeaderId =
        isKeyboardActive && focusedIndex >= 0
            ? columnHeaderId(columns[focusedIndex], focusedIndex)
            : undefined;

    return (
        <div
            tabIndex={isFocusable ? 0 : undefined}
            aria-activedescendant={activeHeaderId}
            className={e("header", { small: small ?? false })}
            role="row"
            aria-label={intl.formatMessage(messages["headerAriaLabel"])}
            onKeyDown={onHeaderKeyDown}
            onFocus={onHeaderFocus}
            onBlur={onHeaderBlur}
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
                const { sortable, renderMenu, headerTooltip } = column;
                const label = <span className={e("text")}>{column.label}</span>;
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
                        id={columnHeaderId(column, index)}
                        aria-sort={sorted ? (desc ? "descending" : "ascending") : "none"}
                        aria-label={
                            renderMenu ? intl.formatMessage(messages["menuHeaderAriaLabel"]) : undefined
                        }
                        aria-description={headerTooltip}
                    >
                        {headerTooltip ? (
                            <UiTooltip
                                anchor={label}
                                content={headerTooltip}
                                triggerBy={["hover"]}
                                isOpen={(isKeyboardActive && isFocused(index)) || undefined}
                                accessibilityHidden
                                optimalPlacement
                            />
                        ) : (
                            label
                        )}
                        {sortable ? <div className={e("sort")}>{arrowIcon}</div> : null}
                    </div>
                );
            })}
        </div>
    );
}

function useHeaderKeyboardActivity(
    handleKeyDown: ((event: KeyboardEvent) => void) | undefined,
    hasFocusedTooltip: boolean,
) {
    const [isKeyboardActive, setIsKeyboardActive] = useState(false);

    const onHeaderKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (isKeyboardActive && hasFocusedTooltip) {
                    event.stopPropagation();
                }
                setIsKeyboardActive(false);
                return;
            }
            setIsKeyboardActive(true);
            handleKeyDown?.(event);
        },
        [handleKeyDown, hasFocusedTooltip, isKeyboardActive],
    );

    const onHeaderFocus = useCallback((event: FocusEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && event.currentTarget.matches(":focus-visible")) {
            setIsKeyboardActive(true);
        }
    }, []);

    const onHeaderBlur = useCallback(() => setIsKeyboardActive(false), []);

    return { isKeyboardActive, onHeaderKeyDown, onHeaderFocus, onHeaderBlur };
}

function useHeaderKeyboardNavigation<T>(
    columns: Array<IUiAsyncTableColumn<T>>,
    handleColumnClick: (key?: keyof T) => void,
) {
    const [focusedIndexPosition, setFocusedIndexPosition] = useState(0);

    useEffect(() => {
        setFocusedIndexPosition(0);
    }, [columns]);

    const focusableIndexes = useMemo(
        () =>
            columns
                .map((_, index) => index)
                .filter((index) => columns[index].sortable || !!columns[index].headerTooltip),
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
