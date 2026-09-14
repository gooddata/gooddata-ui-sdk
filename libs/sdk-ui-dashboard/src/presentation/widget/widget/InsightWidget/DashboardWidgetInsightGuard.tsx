// (C) 2022-2026 GoodData Corporation

import { type ComponentType } from "react";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useIsWidgetRestricted } from "../../../../model/react/useIsWidgetRestricted.js";
import { selectInsightsMap } from "../../../../model/store/insights/insightsSelectors.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import { RestrictedPlaceholder } from "../../common/RestrictedPlaceholder.js";

import { type IDefaultDashboardInsightWidgetProps } from "./types.js";

interface IDashboardWidgetInsightGuardProps extends Omit<IDefaultDashboardInsightWidgetProps, "insight"> {
    Component: ComponentType<IDefaultDashboardInsightWidgetProps>;

    /**
     * What stands in for a widget the user is not allowed to see. Defaults to the placeholder tile,
     * which is all a viewer can be offered; edit mode passes a rendering that keeps the selection and
     * the remove entry.
     */
    RestrictedComponent?: ComponentType<Omit<IDefaultDashboardInsightWidgetProps, "insight">>;
}

// Sometimes this component is rendered even before insights are ready, which blows up.
// Since the behavior is nearly impossible to replicate reliably, let's be defensive here and not render
// anything until the insights "catch up".
export function DashboardWidgetInsightGuard(props: IDashboardWidgetInsightGuardProps) {
    const { widget, screen, dashboardItemClasses, exportData, Component, RestrictedComponent } = props;
    const insights = useDashboardSelector(selectInsightsMap);
    const isRestricted = useIsWidgetRestricted(widget);
    const { RestrictedPlaceholderComponentProvider } = useDashboardComponentsContext();

    // view, edit and export modes all reach the widget through this guard, so this is the single
    // short-circuit that keeps a restricted insight from reaching the widget in any of them
    if (isRestricted) {
        return RestrictedComponent ? (
            <RestrictedComponent {...props} />
        ) : (
            <RestrictedPlaceholder
                screen={screen}
                dashboardItemClasses={dashboardItemClasses}
                exportData={exportData}
                Content={RestrictedPlaceholderComponentProvider(widget)}
            />
        );
    }

    const insight = insights.get(widget.insight);

    return <Component {...props} insight={insight} />;
}
