// (C) 2022-2025 GoodData Corporation

import { ScreenSize, ISettings } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../_staging/dashboard/flexibleLayout/config.js";
import { IDashboardLayoutItemFacade } from "../../_staging/dashboard/flexibleLayout/index.js";
import { getContainerHeight } from "../../_staging/layout/sizing.js";
import { ExtendedDashboardWidget } from "../../model/index.js";

export function getRemainingWidthInRow(
    item: IDashboardLayoutItemFacade<unknown>,
    screen: ScreenSize,
    rowIndex: number,
): number {
    const parentWidth = item.section().layout().size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    const rows = item.section().items().asGridRows(screen);
    const lastRowLength = rows[rowIndex].reduce(
        (acc, rowItem) => acc + rowItem.sizeForScreenWithFallback(screen).gridWidth,
        0,
    );
    return parentWidth - lastRowLength;
}

export function getRemainingHeightInColumn(
    item: IDashboardLayoutItemFacade<ExtendedDashboardWidget | unknown>,
    screen: ScreenSize,
    parentLayoutItem: IDashboardLayoutItemFacade<ExtendedDashboardWidget> | undefined,
    settings: ISettings,
): number {
    // Do not count the remaining height of the column for each row in the column, just the last.
    if (!item.isLastInSection() || parentLayoutItem === undefined) {
        return 0;
    }

    const container = parentLayoutItem.raw();
    const containerContentHeight = getContainerHeight(container!, screen, settings);

    const parentHeight = item.section().layout().size()?.gridHeight ?? 0;
    const remainingHeight = parentHeight - containerContentHeight;

    // sanitize for possible negative values caused by wrong metadata
    return remainingHeight > 0 ? remainingHeight : 0;
}
