// (C) 2022 GoodData Corporation
import { type InsightWidgetComponentSet } from "../../componentDefinition/index.js";
import { type InsightComponentProvider } from "../../dashboardContexts/index.js";
import { InsightDraggingComponent } from "../../dragAndDrop/index.js";

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
