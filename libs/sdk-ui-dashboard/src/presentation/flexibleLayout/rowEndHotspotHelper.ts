// (C) 2022-2025 GoodData Corporation

import { useMemo } from "react";
import { ScreenSize } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../_staging/dashboard/flexibleLayout/config.js";
import { IDashboardLayoutItemFacade } from "../../_staging/dashboard/flexibleLayout/index.js";
import { getContainerHeight } from "../../_staging/layout/sizing.js";
import { useDashboardSelector, selectSettings, ExtendedDashboardWidget } from "../../model/index.js";
import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";
import { useDashboardItemPathAndSize } from "../dashboard/components/DashboardItemPathAndSizeContext.js";

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

export function useRemainingHeightInColumn(
    item: IDashboardLayoutItemFacade<ExtendedDashboardWidget | unknown>,
    isLastInColumn: boolean,
): number {
    const screen = useScreenSize();
    const settings = useDashboardSelector(selectSettings);
    const { layoutItem } = useDashboardItemPathAndSize();

    // Do not count the remaining height of the column for each row in the column, just the last.
    return useMemo(() => {
        if (!isLastInColumn) {
            return 0;
        }

        const container = layoutItem?.raw();
        const containerContentHeight = getContainerHeight(container!, screen, settings);

        const parentHeight = item.section().layout().size()?.gridHeight ?? 0;
        const remainingHeight = parentHeight - containerContentHeight;

        // sanitize for possible negative values caused by wrong metadata
        return remainingHeight > 0 ? remainingHeight : 0;
    }, [item, isLastInColumn, layoutItem, screen, settings]);
}
