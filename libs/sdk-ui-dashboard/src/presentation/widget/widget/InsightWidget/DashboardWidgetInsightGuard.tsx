// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import { type IDefaultDashboardInsightWidgetProps } from "./types.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";

interface IDashboardWidgetInsightGuardProps extends Omit<IDefaultDashboardInsightWidgetProps, "insight"> {
    Component: ComponentType<IDefaultDashboardInsightWidgetProps>;
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
