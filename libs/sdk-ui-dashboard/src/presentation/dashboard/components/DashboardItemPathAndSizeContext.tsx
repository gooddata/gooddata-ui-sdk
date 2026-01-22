// (C) 2024-2026 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/flexibleLayout/config.js";
import { type IDashboardLayoutItemFacade } from "../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { type ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";
import { type ILayoutItemPath } from "../../../types.js";

export interface IDashboardItemPathAndSizeContextProps {
    layoutItem?: IDashboardLayoutItemFacade<ExtendedDashboardWidget>;
    children: ReactNode;
}

export interface IDashboardItemPathAndSize {
    layoutItem: IDashboardLayoutItemFacade<ExtendedDashboardWidget> | undefined;
    layoutItemSize: IDashboardLayoutSizeByScreenSize | undefined;
    layoutItemPath: ILayoutItemPath | undefined;
}

const DEFAULT_LAYOUT_SIZE: IDashboardLayoutSizeByScreenSize = {
    xl: {
        gridWidth: DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
        gridHeight: 0,
    },
};

const DashboardItemPathAndSizeContext = createContext<
    IDashboardLayoutItemFacade<ExtendedDashboardWidget> | undefined
>(undefined);
DashboardItemPathAndSizeContext.displayName = "DashboardScreenSizeContext";

export function DashboardItemPathAndSizeProvider({
    children,
    layoutItem,
}: IDashboardItemPathAndSizeContextProps) {
    return (
        <DashboardItemPathAndSizeContext.Provider value={layoutItem}>
            {children}
        </DashboardItemPathAndSizeContext.Provider>
    );
}

/**
 * Return the current item, its path, and size.
 */
export const useDashboardItemPathAndSize = (): IDashboardItemPathAndSize => {
    const layoutItem = useContext(DashboardItemPathAndSizeContext);
    return {
        layoutItem,
        layoutItemSize: layoutItem?.size() ?? DEFAULT_LAYOUT_SIZE,
        layoutItemPath: layoutItem?.index(),
    };
};
