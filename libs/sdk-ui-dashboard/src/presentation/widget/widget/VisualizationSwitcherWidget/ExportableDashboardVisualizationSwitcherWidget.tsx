// (C) 2020-2026 GoodData Corporation

import cx from "classnames";

import { DashboardItem } from "../../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemBase } from "../../../presentationComponents/DashboardItems/DashboardItemBase.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";

import { type IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";

/**
 * @internal
 */
export function ExportableDashboardVisualizationSwitcherWidget({
    widget,
    screen,
    dashboardItemClasses,
    exportData,
}: IDefaultDashboardVisualizationSwitcherWidgetProps) {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
            exportData={exportData?.section}
        >
            <DashboardItemBase visualizationClassName="gd-visualization-switcher-widget-wrapper" isExport>
                {() => (
                    <DashboardVisualizationSwitcher widget={widget} screen={screen} exportData={exportData} />
                )}
            </DashboardItemBase>
        </DashboardItem>
    );
}
