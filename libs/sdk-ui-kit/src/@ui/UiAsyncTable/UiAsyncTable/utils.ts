// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent } from "react";

import {
    ASYNC_TABLE_ID_PREFIX,
    CHECKBOX_COLUMN_WIDTH,
    MENU_COLUMN_WIDTH,
    MENU_COLUMN_WIDTH_LARGE,
} from "./constants.js";
import { type IUiAsyncTableColumn, type IUiAsyncTableFilterOption } from "../types.js";

export const getColumnWidth = (renderMenu: boolean, isLarge: boolean, widthProp?: number) => {
    return renderMenu ? (isLarge ? MENU_COLUMN_WIDTH_LARGE : MENU_COLUMN_WIDTH) : widthProp;
};

export const getColumnWidths = <T extends { id: string }>(
    columns: IUiAsyncTableColumn<T>[],
    hasCheckbox: boolean,
    isLargeRow: boolean,
) => {
    const columnWidths = columns.map((col) => getColumnWidth(!!col.renderMenu, isLargeRow, col.width));
    return hasCheckbox ? [CHECKBOX_COLUMN_WIDTH, ...columnWidths] : columnWidths;
};

export const getFilterOptionsMap = (options: Array<IUiAsyncTableFilterOption>) => {
    return new Map(options.map((item) => [item.value, item]));
};

export const getColumnHeaderId = (key: string) => {
    return `${ASYNC_TABLE_ID_PREFIX}column-header-${key}`;
};

export const getRowLabelId = (key: number) => {
    return `${ASYNC_TABLE_ID_PREFIX}label-cell-row-${key}`;
};

export const getFilterDropdownId = (label: string) => {
    return `${ASYNC_TABLE_ID_PREFIX}filter-dropdown-${label}`;
};
export const stopPropagationCallback = <T extends HTMLElement>(
    event: MouseEvent<T> | KeyboardEvent<T>,
    callback?: () => void,
): void => {
    event.stopPropagation();
    callback?.();
};

export const computeProportionalWidth = (
    originalColumnWidth: number,
    availableWidth: number,
    columnsWidthSum: number,
) => {
    if (columnsWidthSum === 0) {
        return originalColumnWidth;
    }
    const ratio = originalColumnWidth / columnsWidthSum;
    return Math.floor(availableWidth * ratio);
};
