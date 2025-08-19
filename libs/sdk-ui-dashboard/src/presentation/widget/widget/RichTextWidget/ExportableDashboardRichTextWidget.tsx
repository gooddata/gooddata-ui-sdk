// (C) 2020-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { DashboardRichText } from "../../richText/DashboardRichText.js";

/**
 * @internal
 */
export const ExportableDashboardRichTextWidget: React.FC<IDefaultDashboardRichTextWidgetProps> = ({
    widget,
    screen,
    dashboardItemClasses,
    exportData,
}) => {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-rich-text", "gd-dashboard-view-widget")}
            screen={screen}
            exportData={exportData?.section}
        >
            <DashboardItemBase visualizationClassName="gd-rich-text-widget-wrapper" isExport={true}>
                {() => <DashboardRichText widget={widget} exportData={exportData?.widget} />}
            </DashboardItemBase>
        </DashboardItem>
    );
};
