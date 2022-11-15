// (C) 2022 GoodData Corporation
import { InsightWidgetComponentSet } from "../../componentDefinition";
import { InsightComponentProvider } from "../../dashboardContexts";
import { InsightDraggingComponent } from "../../dragAndDrop/";

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
