// (C) 2025 GoodData Corporation
import React from "react";
import { IDefaultDashboardInsightWidgetProps } from "./types.js";
import { DefaultDashboardInsightWidget } from "./DefaultDashboardInsightWidget.js";

export const ExportableDashboardInsightWidget: React.FC<IDefaultDashboardInsightWidgetProps> = (props) => {
    return <DefaultDashboardInsightWidget {...props} />;
};
