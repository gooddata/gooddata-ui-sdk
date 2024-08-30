// (C) 2024 GoodData Corporation
import { StackWidgetComponentSet } from "../../componentDefinition/index.js";
import { StackComponentProvider } from "../../dashboardContexts/index.js";
import { StackDraggingComponent } from "../../dragAndDrop/index.js";
import { CreatableStack } from "./CreatableStack.js";

/**
 * @internal
 */
export function DefaultDashboardStackComponentSetFactory(
    stackProvider: StackComponentProvider,
): StackWidgetComponentSet {
    return {
        MainComponentProvider: stackProvider,
        creating: {
            CreatePanelListItemComponent: CreatableStack,
            type: "stack",
            priority: 5,
        },
        dragging: {
            DraggingComponent: StackDraggingComponent,
            type: "stack",
        },
        configuration: {
            WidgetConfigPanelComponent: () => null,
        },
    };
}
