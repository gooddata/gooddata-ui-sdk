// (C) 2020-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { IDefaultDashboardStackWidgetProps } from "./types.js";

/**
 * @internal
 */
export const DefaultDashboardStackWidget: React.FC<IDefaultDashboardStackWidgetProps> = ({
    screen,
    dashboardItemClasses,
}) => {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
        >
            <DashboardItemBase visualizationClassName="gd-stack-widget-wrapper">
                {() => <div> No visualisations in stack. </div>}
            </DashboardItemBase>
        </DashboardItem>
    );
};
