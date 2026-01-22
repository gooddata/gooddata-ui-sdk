// (C) 2024-2026 GoodData Corporation

import { CreatableVisualizationSwitcher } from "./CreatableVisualizationSwitcher.js";
import { type VisualizationSwitcherWidgetComponentSet } from "../../componentDefinition/types.js";
import { type VisualizationSwitcherComponentProvider } from "../../dashboardContexts/types.js";
import { VisualizationSwitcherDraggingComponent } from "../../dragAndDrop/draggableWidget/VisualizationSwitcherDraggingComponent.js";

/**
 * @internal
 */
export function DefaultDashboardVisualizationSwitcherComponentSetFactory(
    visualizationSwitcherComponentProvider: VisualizationSwitcherComponentProvider,
): VisualizationSwitcherWidgetComponentSet {
    return {
        MainComponentProvider: visualizationSwitcherComponentProvider,
        creating: {
            CreatePanelListItemComponent: CreatableVisualizationSwitcher,
            type: "visualizationSwitcherListItem",
            priority: 4,
        },
        dragging: {
            DraggingComponent: VisualizationSwitcherDraggingComponent,
            type: "visualizationSwitcher",
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}
