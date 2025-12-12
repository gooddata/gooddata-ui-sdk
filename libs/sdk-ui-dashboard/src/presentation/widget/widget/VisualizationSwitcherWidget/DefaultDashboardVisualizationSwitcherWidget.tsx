// (C) 2020-2025 GoodData Corporation

import cx from "classnames";

import { type IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { useWidgetHighlighting } from "../../common/useWidgetHighlighting.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";

/**
 * @internal
 */
export function DefaultDashboardVisualizationSwitcherWidget({
    widget,
    screen,
    dashboardItemClasses,
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
