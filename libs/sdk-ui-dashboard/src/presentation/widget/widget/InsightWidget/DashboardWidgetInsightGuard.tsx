// (C) 2022-2025 GoodData Corporation
import React from "react";

import { IDefaultDashboardInsightWidgetProps } from "./types.js";
import { selectInsightsMap, useDashboardSelector } from "../../../../model/index.js";

interface IDashboardWidgetInsightGuardProps extends Omit<IDefaultDashboardInsightWidgetProps, "insight"> {
    Component: React.ComponentType<IDefaultDashboardInsightWidgetProps>;
}

// Sometimes this component is rendered even before insights are ready, which blows up.
// Since the behavior is nearly impossible to replicate reliably, let's be defensive here and not render
// anything until the insights "catch up".
export function DashboardWidgetInsightGuard(props: IDashboardWidgetInsightGuardProps) {
    const { widget, Component } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const insight = insights.get(widget.insight);

    return <Component {...props} insight={insight} />;
}
