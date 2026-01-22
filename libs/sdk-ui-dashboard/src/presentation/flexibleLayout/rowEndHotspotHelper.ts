// (C) 2022-2026 GoodData Corporation

import { type ISettings, type ScreenSize } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../_staging/dashboard/flexibleLayout/config.js";
import { type IDashboardLayoutItemFacade } from "../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { areLayoutPathsEqual } from "../../_staging/layout/coordinates.js";
import { getContainerHeight } from "../../_staging/layout/sizing.js";
import { type ExtendedDashboardWidget } from "../../model/types/layoutTypes.js";
import { type ILayoutItemPath } from "../../types.js";

export function getRemainingWidthInRow(
    item: IDashboardLayoutItemFacade<unknown>,
    screen: ScreenSize,
    rowIndex: number,
    currentlyDraggedItemLayoutPath: ILayoutItemPath | undefined,
): number {
    const parentWidth = item.section().layout().size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    const rows = item.section().items().asGridRows(screen);

    const rowLength = rows[rowIndex].reduce((acc, rowItem) => {
        // do not count the width of the currently dragged item if it is in the current row,
        // so the last drop zone will span the whole remaining space when the item is hidden during
        // the drag
        if (areLayoutPathsEqual(currentlyDraggedItemLayoutPath, rowItem.index())) {
            return acc;
        }
        return acc + rowItem.sizeForScreenWithFallback(screen).gridWidth;
    }, 0);
    return parentWidth - rowLength;
}

export function getRemainingHeightInColumn(
    item: IDashboardLayoutItemFacade<unknown>,
    screen: ScreenSize,
    parentLayoutItem: IDashboardLayoutItemFacade<ExtendedDashboardWidget> | undefined,
    settings: ISettings,
): number {
    // Do not count the remaining height of the column for each row in the column, just the last.
    if (!item.isLastInSection() || parentLayoutItem === undefined) {
        return 0;
    }

    const container = parentLayoutItem.raw();
    const containerContentHeight = getContainerHeight(container, screen, settings);

    const parentHeight = item.section().layout().size()?.gridHeight ?? 0;
    const remainingHeight = parentHeight - containerContentHeight;

    // sanitize for possible negative values caused by wrong metadata
    return remainingHeight > 0 ? remainingHeight : 0;
}
