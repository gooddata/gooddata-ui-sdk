// (C) 2025 GoodData Corporation

import { determineWidthForScreen } from "../../../_staging/layout/sizing.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/flexibleLayout/config.js";
import { useDashboardItemPathAndSize } from "../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { useScreenSize } from "../../dashboard/components/DashboardScreenSizeContext.js";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

export const useWidthValidation = (
    itemSize: IDashboardLayoutSizeByScreenSize | undefined,
): {
    isValid: boolean;
    validWidth: number;
    parentWidth: number | undefined;
} => {
    const screen = useScreenSize();
    const itemWidth = determineWidthForScreen(screen, itemSize);
    const { itemSize: parentItemSize } = useDashboardItemPathAndSize();
    const parentWidthForScreen = parentItemSize?.[screen]?.gridWidth;
    const isValid = !(parentWidthForScreen && itemWidth > parentWidthForScreen);

    return {
        isValid: !(parentWidthForScreen && itemWidth > parentWidthForScreen),
        parentWidth: parentWidthForScreen,
        validWidth: isValid ? itemWidth : parentWidthForScreen ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    };
};
