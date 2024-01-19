// (C) 2020-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { DashboardRichText } from "../../richText/DashboardRichText.js";

/**
 * @internal
 */
export const DefaultDashboardRichTextWidget: React.FC<IDefaultDashboardRichTextWidgetProps> = ({
    widget,
    screen,
    dashboardItemClasses,
}) => {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
        >
            <DashboardItemBase visualizationClassName="gd-rich-text-wrapper">
                {() => <DashboardRichText widget={widget} />}
            </DashboardItemBase>
        </DashboardItem>
    );
};
