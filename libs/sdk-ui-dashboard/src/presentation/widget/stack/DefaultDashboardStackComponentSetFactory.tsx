// (C) 2024 GoodData Corporation
import { StackWidgetComponentSet } from "../../componentDefinition/index.js";
import { StackComponentProvider } from "../../dashboardContexts/index.js";
import { StackDraggingComponent } from "../../dragAndDrop/index.js";
import { CreatableStack } from "./CreatableStack.js";
import { DefaultStackConfigurationPanel } from "./DefaultStackConfigurationPanel.js";
import { DefaultDashboardStackPlaceholderWidget } from "./stackPlaceholder/DefaultDashboardStackPlaceholderWidget.js";

/**
 * @internal
 */
export function DefaultDashboardStackComponentSetFactory(
    stackProvider: StackComponentProvider,
): StackWidgetComponentSet {
    return {
        MainComponentProvider: stackProvider,
        creating: {
            CreatingPlaceholderComponent: DefaultDashboardStackPlaceholderWidget,
            CreatePanelListItemComponent: CreatableStack,
            type: "stack",
            priority: 5,
        },
        dragging: {
            DraggingComponent: StackDraggingComponent,
            type: "stack",
        },
        configuration: {
            WidgetConfigPanelComponent: DefaultStackConfigurationPanel,
        },
    };
}
