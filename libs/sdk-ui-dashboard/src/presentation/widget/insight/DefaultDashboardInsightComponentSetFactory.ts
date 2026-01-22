// (C) 2022-2026 GoodData Corporation

import { type InsightWidgetComponentSet } from "../../componentDefinition/types.js";
import { type InsightComponentProvider } from "../../dashboardContexts/types.js";
import { InsightDraggingComponent } from "../../dragAndDrop/draggableWidget/InsightDraggingComponent.js";

/**
 * @internal
 */
export function DefaultDashboardInsightComponentSetFactory(
    insightProvider: InsightComponentProvider,
): InsightWidgetComponentSet {
    return {
        MainComponentProvider: insightProvider,
        dragging: {
            DraggingComponent: InsightDraggingComponent,
            type: "insight",
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}
