// (C) 2024-2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import {
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    IDashboardLayoutItemFacade,
} from "../../../_staging/dashboard/flexibleLayout/index.js";
import { ExtendedDashboardWidget } from "../../../model/index.js";
import { ILayoutItemPath } from "../../../types.js";

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
