// (C) 2022-2025 GoodData Corporation

import { ScreenSize } from "@gooddata/sdk-model";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../_staging/dashboard/flexibleLayout/config.js";
import { IDashboardLayoutItemFacade } from "../../_staging/dashboard/flexibleLayout/index.js";

export function getRemainingWidthInRow(
    item: IDashboardLayoutItemFacade<unknown>,
    screen: ScreenSize,
    rowIndex: number,
): number {
    const parentWidth = item.section().layout().size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    const rows = item.section().items().asGridRows(screen);
    const lastRowLength = rows[rowIndex].reduce(
        (acc, item) => acc + item.sizeForScreenWithFallback(screen).gridWidth,
        0,
    );
    return parentWidth - lastRowLength;
}
