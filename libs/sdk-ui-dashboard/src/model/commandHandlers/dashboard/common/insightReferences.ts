// (C) 2021-2025 GoodData Corporation

import { walkLayout } from "@gooddata/sdk-backend-spi";
import {
    IDashboard,
    IDashboardLayout,
    IWidget,
    ObjRef,
    isDrillToInsight,
    isInsightWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";

const getReferencesFromInsightWidget = (widget: any) => {
    const insightRefs: ObjRef[] = [];
    if (isInsightWidget(widget)) {
        insightRefs.push(widget.insight);
        widget.drills.forEach((drill: any) => {
            if (isDrillToInsight(drill)) {
                insightRefs.push(drill.target);
            }
        });
    }
    return insightRefs;
};

const getReferencesFromVisualizationSwitcherWidget = (widget: any) => {
    const insightRefs: ObjRef[] = [];
    if (isVisualizationSwitcherWidget(widget)) {
        widget.visualizations.forEach((visualization: any) => {
            insightRefs.push(visualization.insight);
            visualization.drills.forEach((drill: any) => {
                if (isDrillToInsight(drill)) {
                    insightRefs.push(drill.target);
                }
            });
        });
    }
    return insightRefs;
};

export function insightReferences(layout?: IDashboardLayout): ObjRef[] {
    const insightRefsFromWidgets: ObjRef[] = [];
    if (layout) {
        walkLayout(layout, {
            widgetCallback: (widget) => {
                if (isInsightWidget(widget)) {
                    insightRefsFromWidgets.push(...getReferencesFromInsightWidget(widget));
                }
                if (isVisualizationSwitcherWidget(widget)) {
                    insightRefsFromWidgets.push(...getReferencesFromVisualizationSwitcherWidget(widget));
                }
            },
        });
    }
    return insightRefsFromWidgets;
}

/**
 * Extracts insight references from a dashboard, including all tabs if present.
 */
export function insightReferencesFromDashboard(dashboard: IDashboard): ObjRef[] {
    const insightRefsFromWidgets: ObjRef[] = [];

    const collectInsightRefs = (widget: any) => {
        if (isInsightWidget(widget)) {
            insightRefsFromWidgets.push(...getReferencesFromInsightWidget(widget));
        }
        if (isVisualizationSwitcherWidget(widget)) {
            insightRefsFromWidgets.push(...getReferencesFromVisualizationSwitcherWidget(widget));
        }
    };

    // Walk through tabs if they exist
    if (dashboard.tabs && dashboard.tabs.length > 0) {
        dashboard.tabs.forEach((tab) => {
            if (tab.layout) {
                walkLayout(tab.layout as IDashboardLayout<IWidget>, {
                    widgetCallback: collectInsightRefs,
                });
            }
        });
    }

    // Also walk through root layout for backwards compatibility
    if (dashboard.layout) {
        walkLayout(dashboard.layout as IDashboardLayout<IWidget>, {
            widgetCallback: collectInsightRefs,
        });
    }

    return insightRefsFromWidgets;
}
