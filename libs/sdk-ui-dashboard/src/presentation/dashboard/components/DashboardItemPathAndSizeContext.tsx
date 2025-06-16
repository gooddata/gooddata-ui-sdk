// (C) 2024-2025 GoodData Corporation

import React, { useContext } from "react";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { ILayoutItemPath } from "../../../types.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/legacyFluidLayout/index.js";
import { IDashboardLayoutItemFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { ExtendedDashboardWidget } from "../../../model/index.js";

export interface IDashboardItemPathAndSizeContextProps {
    layoutItem?: IDashboardLayoutItemFacade<ExtendedDashboardWidget>;
    children: React.ReactNode;
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

const DashboardItemPathAndSizeContext = React.createContext<
    IDashboardLayoutItemFacade<ExtendedDashboardWidget> | undefined
>(undefined);
DashboardItemPathAndSizeContext.displayName = "DashboardScreenSizeContext";

export const DashboardItemPathAndSizeProvider: React.FC<IDashboardItemPathAndSizeContextProps> = ({
    children,
    layoutItem,
}) => (
    <DashboardItemPathAndSizeContext.Provider value={layoutItem}>
        {children}
    </DashboardItemPathAndSizeContext.Provider>
);

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
