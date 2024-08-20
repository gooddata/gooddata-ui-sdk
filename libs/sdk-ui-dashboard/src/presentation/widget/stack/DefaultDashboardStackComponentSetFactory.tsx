// (C) 2024 GoodData Corporation
import { StackWidgetComponentSet } from "../../componentDefinition/index.js";
import { KpiComponentProvider } from "../../dashboardContexts/index.js";
import { KpiDraggingComponent } from "../../dragAndDrop/index.js";
import { DefaultDashboardKpiPlaceholderWidget } from "../kpiPlaceholder/index.js";
import { CreatableStack } from "./CreatableStack.js";
import { DefaultKpiConfigurationPanel } from "./DefaultKpiConfigurationPanel/DefaultKpiConfigurationPanel.js";

/**
 * @internal
 */
export function DefaultDashboardStackComponentSetFactory(
    stackProvider: StackComponentProvider,
): StackWidgetComponentSet {
    return {
        MainComponentProvider: StackComponentProvider,
        creating: {
            CreatingPlaceholderComponent: DefaultDashboardKpiPlaceholderWidget,
            CreatePanelListItemComponent: CreatableStack,
            type: "stack",
            priority: 5,
        },
        dragging: {
            DraggingComponent: KpiDraggingComponent,
            type: "kpi",
        },
        configuration: {
            WidgetConfigPanelComponent: DefaultKpiConfigurationPanel,
        },
    };
}
