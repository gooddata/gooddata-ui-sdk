// (C) 2022 GoodData Corporation
import { KpiWidgetComponentSet } from "../../componentDefinition/index.js";
import { KpiComponentProvider } from "../../dashboardContexts/index.js";
import { KpiDraggingComponent } from "../../dragAndDrop/index.js";
import { DefaultDashboardKpiPlaceholderWidget } from "../kpiPlaceholder/index.js";
import { CreatableKpi } from "./CreatableKpi.js";
import { DefaultKpiConfigurationPanel } from "./DefaultKpiConfigurationPanel/DefaultKpiConfigurationPanel.js";

/**
 * @internal
 */
export function DefaultDashboardKpiComponentSetFactory(
    kpiProvider: KpiComponentProvider,
): KpiWidgetComponentSet {
    return {
        MainComponentProvider: kpiProvider,
        creating: {
            CreatingPlaceholderComponent: DefaultDashboardKpiPlaceholderWidget,
            CreatePanelListItemComponent: CreatableKpi,
            type: "kpi-placeholder",
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
