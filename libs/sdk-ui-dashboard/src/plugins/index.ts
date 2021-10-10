// (C) 2019-2021 GoodData Corporation
export { IDashboardPlugin, DashboardPluginV1, IDashboardPluginMetadata } from "./plugin";
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
