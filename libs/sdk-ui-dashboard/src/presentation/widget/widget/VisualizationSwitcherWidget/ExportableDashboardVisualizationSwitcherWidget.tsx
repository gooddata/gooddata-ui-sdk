// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";

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
}
