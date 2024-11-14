// (C) 2024 GoodData Corporation

import { DashboardLayoutWidgetComponentSet } from "../../componentDefinition/index.js";
import { DashboardLayoutComponentProvider } from "../../dashboardContexts/index.js";
import { DashboardLayoutDraggingComponent } from "../../dragAndDrop/index.js";
import { CreatableDashboardLayout } from "./CreatableDashboardLayout.js";

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
