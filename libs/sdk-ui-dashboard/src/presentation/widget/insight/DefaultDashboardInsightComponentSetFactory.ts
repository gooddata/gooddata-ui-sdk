// (C) 2022 GoodData Corporation
import { InsightWidgetComponentSet } from "../../componentDefinition";
import { InsightComponentProvider } from "../../dashboardContexts";

/**
 * @internal
 */
export function DefaultDashboardInsightComponentSetFactory(
    insightProvider: InsightComponentProvider,
): InsightWidgetComponentSet {
    return {
        MainComponentProvider: insightProvider,
        dragging: {
            DraggingComponent: undefined, // TODO when adding widget moving
            type: "insight",
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}
