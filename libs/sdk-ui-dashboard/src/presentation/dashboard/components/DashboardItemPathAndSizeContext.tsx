// (C) 2024 GoodData Corporation

import React, { useContext, useMemo } from "react";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { ILayoutItemPath } from "../../../types.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../_staging/dashboard/legacyFluidLayout/index.js";

export interface IDashboardItemPathAndSizeContextProps {
    itemSize?: IDashboardLayoutSizeByScreenSize;
    itemPath?: ILayoutItemPath;
    children: React.ReactNode;
}

export interface IDashboardItemPathAndSizeContext {
    itemSize: IDashboardLayoutSizeByScreenSize | undefined;
    itemPath: ILayoutItemPath | undefined;
}

const ROOT_LAYOUT_VALUE: IDashboardItemPathAndSizeContext = {
    itemSize: {
        xl: {
            gridWidth: DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
            gridHeight: 0,
        },
    },
    itemPath: undefined,
};

const DashboardItemPathAndSizeContext =
    React.createContext<IDashboardItemPathAndSizeContext>(ROOT_LAYOUT_VALUE);
DashboardItemPathAndSizeContext.displayName = "DashboardScreenSizeContext";

export const DashboardItemPathAndSizeProvider: React.FC<IDashboardItemPathAndSizeContextProps> = ({
    children,
    itemSize,
    itemPath,
}) => {
    const value = useMemo(
        () => ({
            itemSize,
            itemPath,
        }),
        [itemSize, itemPath],
    );

    return (
        <DashboardItemPathAndSizeContext.Provider value={value}>
            {children}
        </DashboardItemPathAndSizeContext.Provider>
    );
};

/**
 * Return current item path and size.
 */
export const useDashboardItemPathAndSize = (): IDashboardItemPathAndSizeContext => {
    const context = useContext(DashboardItemPathAndSizeContext);
    return {
        itemSize: context?.itemSize ?? ROOT_LAYOUT_VALUE.itemSize,
        itemPath: context?.itemPath ?? ROOT_LAYOUT_VALUE.itemPath,
    };
};
