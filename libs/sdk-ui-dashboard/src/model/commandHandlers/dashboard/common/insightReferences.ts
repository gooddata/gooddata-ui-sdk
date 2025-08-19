// (C) 2021-2025 GoodData Corporation
import { walkLayout } from "@gooddata/sdk-backend-spi";
import {
    IDashboardLayout,
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
