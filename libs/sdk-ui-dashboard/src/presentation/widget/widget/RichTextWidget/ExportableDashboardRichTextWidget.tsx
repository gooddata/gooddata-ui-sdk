// (C) 2020-2026 GoodData Corporation

import cx from "classnames";

import { type IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { DashboardItem } from "../../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemBase } from "../../../presentationComponents/DashboardItems/DashboardItemBase.js";
import { DashboardRichText } from "../../richText/DashboardRichText.js";

/**
 * @internal
 */
export function ExportableDashboardRichTextWidget({
    widget,
    screen,
    dashboardItemClasses,
    exportData,
}: IDefaultDashboardRichTextWidgetProps) {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-rich-text", "gd-dashboard-view-widget")}
            screen={screen}
            exportData={exportData?.section}
        >
            <DashboardItemBase visualizationClassName="gd-rich-text-widget-wrapper" isExport>
                {() => <DashboardRichText widget={widget} exportData={exportData?.widget} />}
            </DashboardItemBase>
        </DashboardItem>
    );
}
