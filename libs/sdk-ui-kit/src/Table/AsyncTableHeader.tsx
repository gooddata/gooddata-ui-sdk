// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";
import { IColumn, IAsyncTableHeaderProps } from "./types.js";
import { e } from "./asyncTableBem.js";
import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { AsyncTableCheckbox } from "./AsyncTableCheckbox.js";
import { MENU_COLUMN_WIDTH } from "./constants.js";
import { makeKeyboardNavigation } from "../@ui/@utils/keyboardNavigation.js";

const arrowIcon = <UiIcon type="dropDown" size={14} color="complementary-6" />;

const headerCellKeyboardNavigation = makeKeyboardNavigation({
    onSelect: [{ code: ["Enter", "Space"] }],
});

export function AsyncTableHeader<T>({
    columns,
    handleColumnClick,
    sortBy,
    sortDirection,
    hasCheckbox,
    width,
}: IAsyncTableHeaderProps<T>) {
    const handleKeyDown = useCallback(
        (column: IColumn<T>) =>
            headerCellKeyboardNavigation({
                onSelect: () => {
                    if (column.sortable) {
                        handleColumnClick(column.key);
                    }
                },
            }),
        [handleColumnClick],
    );

    return (
        <div className={e("header")} style={{ width }}>
            {hasCheckbox ? <AsyncTableCheckbox /> : null}
            {columns.map((column, index) => {
                const width = column.renderMenu ? MENU_COLUMN_WIDTH : column.width;
                const sorted = sortBy && sortBy === column.key;
                const desc = sorted && sortDirection === "desc";
                const { sortable } = column;
                return (
                    <div
                        key={index}
                        tabIndex={sortable ? 0 : -1}
                        onKeyDown={handleKeyDown(column)}
                        onClick={() => sortable && handleColumnClick(column.key)}
                        className={e("cell", { sorted, desc, sortable })}
                        style={{ width }}
                    >
                        <span className={e("text")}>{column.label}</span>
                        {sortable ? <div className={e("sort")}>{arrowIcon}</div> : null}
                    </div>
                );
            })}
        </div>
    );
}
