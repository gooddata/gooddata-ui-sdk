// (C) 2022-2024 GoodData Corporation

import { ScreenSize } from "@gooddata/sdk-model";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../_staging/dashboard/flexibleLayout/config.js";
import { IDashboardLayoutItemFacade } from "../../_staging/dashboard/flexibleLayout/index.js";

export function getRemainingWidthInRow(
    item: IDashboardLayoutItemFacade<unknown>,
    screen: ScreenSize,
): number {
    const parentWidth = item.section().layout().size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    const rows = item.section().items().asGridRows(screen);
    const lastRow = rows[rows.length - 1];
    const lastRowLength = lastRow.reduce(
        (acc, item) => acc + item.sizeForScreenWithFallback(screen).gridWidth,
        0,
    );
    return parentWidth - lastRowLength;
}
