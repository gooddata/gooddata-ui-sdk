// (C) 2021-2024 GoodData Corporation
import {
    ObjRef,
    isInsightWidget,
    isDrillToInsight,
    IDashboardLayout,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";
import { walkLayout } from "@gooddata/sdk-backend-spi";

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
