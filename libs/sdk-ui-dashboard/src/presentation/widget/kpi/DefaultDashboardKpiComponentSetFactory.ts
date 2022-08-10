// (C) 2022 GoodData Corporation
import { KpiWidgetComponentSet } from "../../componentDefinition";
import { KpiComponentProvider } from "../../dashboardContexts";
import { DefaultDashboardKpiPlaceholderWidget } from "../kpiPlaceholder";
import { CreatableKpi } from "./CreatableKpi";
import { DefaultKpiConfigurationPanel } from "./DefaultKpiConfigurationPanel/DefaultKpiConfigurationPanel";

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
            CreatePanelItemComponent: CreatableKpi,
            type: "kpi-placeholder",
            priority: 5,
        },
        dragging: {
            DraggingComponent: undefined, // TODO when adding widget moving
            type: "kpi",
        },
        configuration: {
            WidgetConfigPanelComponent: DefaultKpiConfigurationPanel,
        },
    };
}
