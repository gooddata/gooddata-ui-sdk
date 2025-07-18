// (C) 2020-2025 GoodData Corporation
import cx from "classnames";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { DashboardRichText } from "../../richText/DashboardRichText.js";
import { useWidgetHighlighting } from "../../common/useWidgetHighlighting.js";

/**
 * @internal
 */
export function DefaultDashboardRichTextWidget({
    dashboardItemClasses,
    screen,
    widget,
}: IDefaultDashboardRichTextWidgetProps) {
    const { elementRef, highlighted } = useWidgetHighlighting(widget);

    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-rich-text", "gd-dashboard-view-widget", {
                "gd-highlighted": highlighted,
            })}
            screen={screen}
            ref={elementRef}
        >
            <DashboardItemBase visualizationClassName="gd-rich-text-widget-wrapper">
                {() => <DashboardRichText widget={widget} />}
            </DashboardItemBase>
        </DashboardItem>
    );
}
