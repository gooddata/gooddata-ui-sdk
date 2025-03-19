// (C) 2022-2024 GoodData Corporation
import React from "react";

import { useDashboardSelector, selectInsightsMap } from "../../../../model/index.js";

import { IDefaultDashboardInsightWidgetProps } from "./types.js";

interface IDashboardWidgetInsightGuardProps extends Omit<IDefaultDashboardInsightWidgetProps, "insight"> {
    Component: React.ComponentType<IDefaultDashboardInsightWidgetProps>;
}

// Sometimes this component is rendered even before insights are ready, which blows up.
// Since the behavior is nearly impossible to replicate reliably, let's be defensive here and not render
// anything until the insights "catch up".
export const DashboardWidgetInsightGuard: React.FC<IDashboardWidgetInsightGuardProps> = (props) => {
    const { widget, Component } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    return <Component {...props} insight={insight} />;
};
