// (C) 2019-2026 GoodData Corporation

export {
    DashboardPluginV1,
    type IDashboardPluginContract_V1,
    type DashboardPluginDescriptor,
} from "./plugin.js";
export { newDashboardEngine, type IDashboardEngine } from "./engine.js";
export type {
    IDashboardEventHandling,
    IDashboardCustomizer,
    IDashboardInsightCustomizer,
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
    ExportLayoutCustomizationFn,
    IExportLayoutCustomizer,
    SectionSlidesTransformer,
    ISectionSlidesTransformerFunction,
} from "./customizer.js";
