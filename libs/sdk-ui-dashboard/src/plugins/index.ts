// (C) 2019-2021 GoodData Corporation
export { IDashboardPluginContract_V1, DashboardPluginV1, DashboardPluginDescriptor } from "./plugin";
export { IDashboardEngine, newDashboardEngine } from "./engine";
export {
    IDashboardEventHandling,
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardKpiCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardWidgetCustomizer,
    FluidLayoutCustomizationFn,
    IFluidLayoutCustomizer,
    DashboardStateChangeCallback,
} from "./customizer";
