// (C) 2026 GoodData Corporation

// oxlint-disable no-barrel-files/no-barrel-files

/**
 * Analytical Designer as a React component.
 *
 * @packageDocumentation
 */

export { AnalyticalDesigner } from "./embedding/AnalyticalDesigner.js";
export {
    type AnalyticalDesignerHiddenAction,
    type IAnalyticalDesignerApi,
    type IAnalyticalDesignerCacheReset,
    type IAnalyticalDesignerConfig,
    type IAnalyticalDesignerEvent,
    type IAnalyticalDesignerEventHandler,
    type IAnalyticalDesignerInsightOpenedData,
    type IAnalyticalDesignerProps,
    type IAnalyticalDesignerTelemetryCallbacks,
} from "./embedding/analyticalDesignerTypes.js";
export {
    type AnalyticalDesignerSlotComponent,
    type IAnalyticalDesignerErrorProps,
    type IAnalyticalDesignerLoadingProps,
    type IAnalyticalDesignerSlots,
} from "./embedding/slots.js";
