// (C) 2021-2023 GoodData Corporation
import { ObjRef, isInsightWidget, isDrillToInsight, IDashboardLayout } from "@gooddata/sdk-model";
import { walkLayout } from "@gooddata/sdk-backend-spi";

export function insightReferences(layout?: IDashboardLayout): ObjRef[] {
    const insightRefsFromWidgets: ObjRef[] = [];
    if (layout) {
        walkLayout(layout, {
            widgetCallback: (widget) => {
                if (isInsightWidget(widget)) {
                    insightRefsFromWidgets.push(widget.insight);
                    widget.drills.forEach((drill) => {
                        if (isDrillToInsight(drill)) {
                            insightRefsFromWidgets.push(drill.target);
                        }
                    });
                }
            },
        });
    }
    return insightRefsFromWidgets;
}
