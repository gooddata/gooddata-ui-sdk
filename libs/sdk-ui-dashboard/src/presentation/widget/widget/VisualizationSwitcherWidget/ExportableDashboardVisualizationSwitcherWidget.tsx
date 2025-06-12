// (C) 2020-2025 GoodData Corporation

import React from "react";
import cx from "classnames";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";

/**
 * @internal
 */
export const ExportableDashboardVisualizationSwitcherWidget: React.FC<
    IDefaultDashboardVisualizationSwitcherWidgetProps
> = ({ widget, screen, dashboardItemClasses, exportData }) => {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
            exportData={exportData?.section}
        >
            <DashboardItemBase
                visualizationClassName="gd-visualization-switcher-widget-wrapper"
                isExport={true}
            >
                {() => (
                    <DashboardVisualizationSwitcher widget={widget} screen={screen} exportData={exportData} />
                )}
            </DashboardItemBase>
        </DashboardItem>
    );
};
