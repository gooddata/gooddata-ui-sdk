// (C) 2022-2024 GoodData Corporation

import React from "react";
import cx from "classnames";

import { DashboardItem, DashboardItemBase } from "../presentationComponents/index.js";
import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";

/**
 * @internal
 */
export const ViewModeEmptyNestedLayout: React.FC = () => {
    const screen = useScreenSize();
    return (
        <DashboardItem className={cx("gd-empty-nested-layout", "gd-dashboard-view-widget")} screen={screen}>
            <DashboardItemBase>{() => <div />}</DashboardItemBase>
        </DashboardItem>
    );
};
