// (C) 2024-2026 GoodData Corporation

import { CreatableDashboardLayout } from "./CreatableDashboardLayout.js";
import { type DashboardLayoutWidgetComponentSet } from "../../componentDefinition/types.js";
import { type DashboardLayoutComponentProvider } from "../../dashboardContexts/types.js";
import { DashboardLayoutDraggingComponent } from "../../dragAndDrop/draggableWidget/DashboardLayoutDraggingComponent.js";

/**
 * @internal
 */
export function DefaultDashboardLayoutComponentSetFactory(
    dashboardLayoutComponentProvider: DashboardLayoutComponentProvider,
): DashboardLayoutWidgetComponentSet {
    return {
        MainComponentProvider: dashboardLayoutComponentProvider,
        creating: {
            CreatePanelListItemComponent: CreatableDashboardLayout,
            type: "dashboardLayoutListItem",
            priority: 3,
        },
        dragging: {
            DraggingComponent: DashboardLayoutDraggingComponent,
            type: "dashboardLayout",
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}
