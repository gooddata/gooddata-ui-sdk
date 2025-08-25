// (C) 2025 GoodData Corporation

import { CHECKBOX_COLUMN_WIDTH, MENU_COLUMN_WIDTH, MENU_COLUMN_WIDTH_LARGE } from "./constants.js";
import { UiAsyncTableColumn, UiAsyncTableFilterOption } from "../types.js";

export const getColumnWidth = (renderMenu: boolean, isLarge: boolean, widthProp?: number) => {
    return renderMenu ? (isLarge ? MENU_COLUMN_WIDTH_LARGE : MENU_COLUMN_WIDTH) : widthProp;
};

export const getColumnWidths = <T extends { id: string }>(
    columns: UiAsyncTableColumn<T>[],
    hasCheckbox: boolean,
    isLargeRow: boolean,
) => {
    const columnWidths = columns.map((col) => getColumnWidth(!!col.renderMenu, isLargeRow, col.width));
    return hasCheckbox ? [CHECKBOX_COLUMN_WIDTH, ...columnWidths] : columnWidths;
};

export const getFilterOptionsMap = (options: Array<UiAsyncTableFilterOption>) => {
    return new Map(options.map((item) => [item.value, item]));
};
