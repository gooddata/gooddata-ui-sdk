// (C) 2020-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { DashboardItem } from "../../../presentationComponents/index.js";
import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { RichText } from "./RichText.js";
import { DashboardItemBase } from "../../../presentationComponents/DashboardItems/DashboardItemBase.js";

/**
 * @internal
 */
export const DefaultDashboardRichTextWidget: React.FC<IDefaultDashboardRichTextWidgetProps> = ({
    widget,
    screen,
    // onError,
    // onLoadingChanged,
    dashboardItemClasses,
}) => {
    return (
        <DashboardItem
            className={cx(dashboardItemClasses, "type-visualization", "gd-dashboard-view-widget")}
            screen={screen}
        >
            <DashboardItemBase visualizationClassName="gd-rich-text-wrapper">
                {() => <RichText text={widget?.content} />}
            </DashboardItemBase>
        </DashboardItem>
    );
};
