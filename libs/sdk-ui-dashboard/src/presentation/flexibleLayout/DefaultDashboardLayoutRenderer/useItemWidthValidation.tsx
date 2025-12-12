// (C) 2025 GoodData Corporation

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/flexibleLayout/config.js";
import { getContainerDirection } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { useDashboardItemPathAndSize } from "../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";

export const useWidthValidation = (
    itemSize: IDashboardLayoutSizeByScreenSize | undefined,
): {
    isValid: boolean;
    validWidth: number;
    parentWidth: number | undefined;
} => {
    const screen = useScreenSize();
    const itemWidth = determineWidthForScreen(screen, itemSize);
    const { layoutItemSize: parentItemSize, layoutItem: parentLayout } = useDashboardItemPathAndSize();
    const direction = getContainerDirection(parentLayout);
    const parentWidthForScreen = parentItemSize?.[screen]?.gridWidth;
    const sanitizedParentWidthForScreen = parentWidthForScreen ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    const isValid =
        direction === "column"
            ? itemWidth === sanitizedParentWidthForScreen
            : itemWidth <= sanitizedParentWidthForScreen;
    // This is a sanitization for a wrong metadata object with incorrect widths set.
    // Actual resizing of widgets to match parent constrain is done by resizeWidthHandler.
    const sanitizedItemWidth = isValid ? itemWidth : sanitizedParentWidthForScreen;
    return {
        isValid,
        parentWidth: sanitizedParentWidthForScreen,
        validWidth: sanitizedItemWidth,
    };
};
