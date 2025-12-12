// (C) 2024-2025 GoodData Corporation

import { CreatableDashboardLayout } from "./CreatableDashboardLayout.js";
import { type DashboardLayoutWidgetComponentSet } from "../../componentDefinition/index.js";
import { type DashboardLayoutComponentProvider } from "../../dashboardContexts/index.js";
import { DashboardLayoutDraggingComponent } from "../../dragAndDrop/index.js";

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
