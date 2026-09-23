// (C) 2026 GoodData Corporation

import {
    type IDashboardDefinition,
    type IDashboardLayout,
    type IDashboardWidget,
    type IInsight,
    areObjRefsEqual,
    insightRef,
    isDashboardLayout,
    isDrillToCustomUrl,
    isInsightWidget,
    isInsightWidgetDefinition,
    isVisualizationSwitcherWidget,
    isVisualizationSwitcherWidgetDefinition,
} from "@gooddata/sdk-model";
import { getDrillToCustomUrlReferenceMap } from "@gooddata/sdk-model/internal";

/** Refresh dependencies at the save boundary, including untouched drills on existing dashboards. */
export function dashboardWithDrillReferences(
    dashboard: IDashboardDefinition,
    insights: IInsight[],
): IDashboardDefinition {
    function updateWidget(widget: IDashboardWidget): IDashboardWidget {
        if (isDashboardLayout(widget)) {
            return updateLayout(widget);
        }
        if (isVisualizationSwitcherWidget(widget) || isVisualizationSwitcherWidgetDefinition(widget)) {
            return { ...widget, visualizations: widget.visualizations.map(updateInsightWidget) };
        }
        return updateInsightWidget(widget);
    }

    function updateInsightWidget<T extends IDashboardWidget>(widget: T): T {
        if (!isInsightWidget(widget) && !isInsightWidgetDefinition(widget)) {
            return widget;
        }
        const insight = insights.find((candidate) => areObjRefsEqual(insightRef(candidate), widget.insight));
        return {
            ...widget,
            drills: widget.drills.map((drill) =>
                isDrillToCustomUrl(drill)
                    ? {
                          ...drill,
                          target: {
                              ...drill.target,
                              references: getDrillToCustomUrlReferenceMap(drill.target, insight),
                          },
                      }
                    : drill,
            ),
        };
    }

    function updateLayout<T extends IDashboardLayout>(layout: T): T {
        return {
            ...layout,
            sections: layout.sections.map((section) => ({
                ...section,
                items: section.items.map((item) => ({
                    ...item,
                    widget: item.widget ? updateWidget(item.widget) : item.widget,
                })),
            })),
        };
    }

    return {
        ...dashboard,
        layout: dashboard.layout ? updateLayout(dashboard.layout) : undefined,
        tabs: dashboard.tabs?.map((tab) => ({
            ...tab,
            layout: tab.layout ? updateLayout(tab.layout) : undefined,
        })),
    };
}
