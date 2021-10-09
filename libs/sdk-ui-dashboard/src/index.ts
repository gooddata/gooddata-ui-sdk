// (C) 2019-2021 GoodData Corporation

/*
 */

// exported only for api-extractor's sake
export { DateFilterConfigValidationResult } from "./_staging/dateFilterConfig/validation";

// ObjRefMap & factories will be part of the public API.. although in different package
export { ObjRefMap, ObjRefMapConfig, newDisplayFormMap } from "./_staging/metadata/objRefMap";

// TODO remove export after values resolver call from KD is obsolete
export { resolveFilterValues } from "./model/commandHandlers/drill/common/filterValuesResolver";

export * from "./model";
export * from "./presentation";
export * from "./types";
export * from "./converters";

export { IDashboardPlugin, DashboardPluginV1, IDashboardPluginMetadata } from "./plugins/plugin";
export { IDashboardEngine, newDashboardEngine } from "./plugins/engine";
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
} from "./plugins/customizer";
export { InsightPlaceholderWidget, KpiPlaceholderWidget } from "./widgets/placeholders/types";
