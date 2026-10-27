// (C) 2022-2026 GoodData Corporation

import { type InsightWidgetComponentSet } from "../../componentDefinition/types.js";
import { type InsightComponentProvider } from "../../dashboardContexts/types.js";
import { InsightDraggingComponent } from "../../dragAndDrop/draggableWidget/InsightDraggingComponent.js";
import { InsightEditorCreatePanelItem } from "../../insightEditor/InsightEditorCreatePanelItem.js";
import { InsightEditorPlaceholder } from "../../insightEditor/InsightEditorPlaceholder.js";

/**
 * @internal
 */
export function DefaultDashboardInsightComponentSetFactory(
    insightProvider: InsightComponentProvider,
    enableInsightEditing = false,
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
        ...(enableInsightEditing
            ? {
                  creating: {
                      CreatePanelListItemComponent: InsightEditorCreatePanelItem,
                      type: "insight-placeholder",
                      CreatingPlaceholderComponent: InsightEditorPlaceholder,
                      priority: 1,
                  },
              }
            : {}),
    };
}
