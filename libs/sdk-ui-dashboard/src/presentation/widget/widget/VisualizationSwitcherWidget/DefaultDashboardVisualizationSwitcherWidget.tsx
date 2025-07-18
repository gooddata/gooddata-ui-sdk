// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";
import { useWidgetHighlighting } from "../../common/useWidgetHighlighting.js";

/**
 * @internal
 */
export function DefaultDashboardVisualizationSwitcherWidget({
    dashboardItemClasses,
    screen,
    widget,
}: IDefaultDashboardVisualizationSwitcherWidgetProps) {
    const { elementRef, highlighted } = useWidgetHighlighting(widget);

    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget", {
                "gd-highlighted": highlighted,
            })}
            screen={screen}
            ref={elementRef}
        >
            <DashboardItemBase visualizationClassName="gd-visualization-switcher-widget-wrapper">
                {() => <DashboardVisualizationSwitcher widget={widget} screen={screen} />}
            </DashboardItemBase>
        </DashboardItem>
    );
}
