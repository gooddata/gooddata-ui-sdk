// (C) 2024 GoodData Corporation

import { VisualizationSwitcherWidgetComponentSet } from "../../componentDefinition/index.js";
import { VisualizationSwitcherComponentProvider } from "../../dashboardContexts/index.js";
import { VisualizationSwitcherDraggingComponent } from "../../dragAndDrop/index.js";
import { CreatableVisualizationSwitcher } from "./CreatableVisualizationSwitcher.js";

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
