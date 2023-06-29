// (C) 2021-2023 GoodData Corporation

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
    ResolvedEntitlements,
    ResolvableFilter,
    ResolvedDateFilterValues,
    IResolvedAttributeFilterValues,
    IResolvedDateFilterValue,
    IResolvedFilterValues,
    WidgetsOverlayFn,
    IDashboardWidgetOverlay,
} from "./types/commonTypes.js";
export {
    ICustomWidget,
    ICustomWidgetDefinition,
    ICustomWidgetBase,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    isCustomWidgetDefinition,
    isCustomWidgetBase,
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
} from "./types/layoutTypes.js";
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
    WidgetDescription,
} from "./types/widgetTypes.js";

export {
    BrokenAlertType,
    IBrokenAlertFilterBasicInfo,
    BrokenAlertDateFilterInfo,
    BrokenAlertAttributeFilterInfo,
    isBrokenAlertDateFilterInfo,
    isBrokenAlertAttributeFilterInfo,
} from "./types/alertTypes.js";

export { ICsvExportConfig, IExportConfig, IXlsxExportConfig } from "./types/exportTypes.js";

export {
    IConnectingAttribute,
    IDashboardAttributeFilterDisplayForms,
    IDashboardAttributeFilterParentItem,
    IParentWithConnectingAttributes,
    IUseAttributeElements,
} from "./types/attributeFilterTypes.js";

export { DRILL_TO_URL_PLACEHOLDER } from "./types/drillTypes.js";
export {
    DashboardAccessibilityLimitation,
    IInaccessibleDashboard,
} from "./types/inaccessibleDashboardTypes.js";

export * from "./react/index.js";
export * from "./commands/index.js";
export * from "./events/index.js";
export * from "./queries/index.js";
export * from "./store/index.js";

export { selectDateDatasetsForInsight } from "./queryServices/queryInsightDateDatasets.js";
export { selectInsightAttributesMeta } from "./queryServices/queryInsightAttributesMeta.js";
export { selectDateDatasetsForMeasure } from "./queryServices/queryMeasureDateDatasets.js";

export {
    DashboardEventHandler,
    DashboardEventHandlerFn,
    anyEventHandler,
    anyDashboardEventHandler,
    singleEventTypeHandler,
    commandStartedEventHandler,
    commandFailedEventHandler,
    DashboardEventEvalFn,
} from "./eventHandlers/eventHandler.js";
export { newDrillToSameDashboardHandler } from "./eventHandlers/drillToSameDashboardHandlerFactory.js";
export * from "./headlessDashboard/index.js";

export { isTemporaryIdentity } from "./utils/dashboardItemUtils.js";
