// (C) 2025 GoodData Corporation

import { MENU_COLUMN_WIDTH, MENU_COLUMN_WIDTH_LARGE } from "./constants.js";

export const getColumnWidth = (renderMenu: boolean, isLarge: boolean, widthProp?: number) => {
    return renderMenu ? (isLarge ? MENU_COLUMN_WIDTH_LARGE : MENU_COLUMN_WIDTH) : widthProp;
};
