// (C) 2019-2025 GoodData Corporation
export type { IDashboardPluginContract_V1, DashboardPluginDescriptor } from "./plugin.js";
export { DashboardPluginV1 } from "./plugin.js";
export type { IDashboardEngine } from "./engine.js";
export { newDashboardEngine } from "./engine.js";
export type {
    IDashboardEventHandling,
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
    IDashboardKpiCustomizer,
    IDashboardLayoutCustomizer,
    IDashboardContentCustomizer,
    IDashboardWidgetCustomizer,
    FluidLayoutCustomizationFn,
    IFluidLayoutCustomizer,
    IFilterBarCustomizer,
    DashboardStateChangeCallback,
    FilterBarRenderingMode,
    IAttributeFiltersCustomizer,
    IDateFiltersCustomizer,
    IFiltersCustomizer,
    ITitleCustomizer,
    ITopBarCustomizer,
    ILoadingCustomizer,
    IVisualizationSwitcherCustomizer,
    IRichTextCustomizer,
} from "./customizer.js";
