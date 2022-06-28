// (C) 2021-2022 GoodData Corporation

/*
 * The public API of the Dashboard model is exported from here.
 *
 * What is exported:
 *
 * -  hooks do dispatch commands / call selectors
 * -  all selectors & the typing of state with which they work
 * -  all events & their types. Note: event factories are not exported on purpose. outside code should not be
 *    creating events
 * -  all commands, their types & command factories
 */

export {
    DashboardContext,
    ObjectAvailabilityConfig,
    DashboardConfig,
    DashboardModelCustomizationFns,
    DashboardTransformFn,
    FiltersInfo,
    ResolvedDashboardConfig,
    ResolvableFilter,
    ResolvedDateFilterValues,
    IResolvedAttributeFilterValues,
    IResolvedDateFilterValue,
    IResolvedFilterValues,
} from "./types/commonTypes";
export {
    ICustomWidget,
    ICustomWidgetDefinition,
    ICustomWidgetBase,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    isCustomWidgetDefinition,
    isCustomWidget,
    ExtendedDashboardItem,
    extendedWidgetDebugStr,
    ExtendedDashboardWidget,
    DashboardItemDefinition,
    StashedDashboardItemsId,
    ExtendedDashboardLayoutSection,
    RelativeIndex,
    ExtendedDashboardItemType,
    ExtendedDashboardItemTypes,
} from "./types/layoutTypes";
export {
    FilterOp,
    FilterOpReplaceAll,
    FilterOpUnignoreAttributeFilter,
    FilterOpIgnoreAttributeFilter,
    FilterOpReplaceAttributeIgnores,
    FilterOpDisableDateFilter,
    FilterOpEnableDateFilter,
    FilterOperations,
    WidgetFilterOperation,
    WidgetHeader,
} from "./types/widgetTypes";

export {
    BrokenAlertType,
    IBrokenAlertFilterBasicInfo,
    BrokenAlertDateFilterInfo,
    BrokenAlertAttributeFilterInfo,
    isBrokenAlertDateFilterInfo,
    isBrokenAlertAttributeFilterInfo,
} from "./types/alertTypes";

export { ICsvExportConfig, IExportConfig, IXlsxExportConfig } from "./types/exportTypes";

export {
    IConnectingAttribute,
    ConnectingAttributeMatrix,
    IDashboardAttributeFilterDisplayForms,
    IDashboardAttributeFilterParentItem,
    IParentWithConnectingAttributes,
} from "./types/attributeFilterTypes";

export * from "./react";
export * from "./commands";
export * from "./events";
export * from "./queries";
export * from "./store";

export { selectDateDatasetsForInsight } from "./queryServices/queryInsightDateDatasets";
export { selectInsightAttributesMeta } from "./queryServices/queryInsightAttributesMeta";
export { selectDateDatasetsForMeasure } from "./queryServices/queryMeasureDateDatasets";

export {
    DashboardEventHandler,
    DashboardEventHandlerFn,
    anyEventHandler,
    anyDashboardEventHandler,
    singleEventTypeHandler,
    commandStartedEventHandler,
    commandFailedEventHandler,
    DashboardEventEvalFn,
} from "./eventHandlers/eventHandler";
export { newDrillToSameDashboardHandler } from "./eventHandlers/drillToSameDashboardHandlerFactory";
export * from "./headlessDashboard";
