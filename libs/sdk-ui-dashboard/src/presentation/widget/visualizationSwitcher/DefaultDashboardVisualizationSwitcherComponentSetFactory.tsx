// (C) 2024-2025 GoodData Corporation

import { CreatableVisualizationSwitcher } from "./CreatableVisualizationSwitcher.js";
import { type VisualizationSwitcherWidgetComponentSet } from "../../componentDefinition/index.js";
import { type VisualizationSwitcherComponentProvider } from "../../dashboardContexts/index.js";
import { VisualizationSwitcherDraggingComponent } from "../../dragAndDrop/index.js";

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
