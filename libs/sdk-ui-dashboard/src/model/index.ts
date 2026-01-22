// (C) 2021-2026 GoodData Corporation

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

export type {
    DashboardContext,
    DashboardItem,
    DashboardItemVisualization,
    DashboardItemVisualizationContent,
    ObjectAvailabilityConfig,
    DashboardConfig,
    IDashboardExportSlideConfig,
    IDashboardFocusObject,
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
    PrivateDashboardContext,
    DashboardLayoutExportTransformFn,
    isDashboardItemVisualization,
    isDashboardItemVisualizationContent,
} from "./types/commonTypes.js";
export {
    type ICustomWidget,
    type ICustomWidgetDefinition,
    type ICustomWidgetBase,
    type ExtendedDashboardItem,
    type ExtendedDashboardWidget,
    type DashboardItemDefinition,
    type StashedDashboardItemsId,
    type ExtendedDashboardLayoutSection,
    type RelativeIndex,
    type ExtendedDashboardItemType,
    type ExtendedDashboardItemTypes,
    type ExtendedDashboardLayoutWidget,
    type FilterableDashboardWidget,
    newCustomWidget,
    newDashboardItem,
    newDashboardSection,
    isCustomWidgetDefinition,
    isCustomWidgetBase,
    isCustomWidget,
    extendedWidgetDebugStr,
    isExtendedDashboardLayoutWidget,
} from "./types/layoutTypes.js";
export type {
    IFilterOp,
    IFilterOpReplaceAll,
    IFilterOpUnignoreAttributeFilter,
    IFilterOpIgnoreAttributeFilter,
    IFilterOpReplaceAttributeIgnores,
    IFilterOpDisableDateFilter,
    IFilterOpEnableDateFilter,
    IFilterOpUnignoreDateFilter,
    IFilterOpIgnoreDateFilter,
    FilterOperations,
    IWidgetFilterOperation,
    IWidgetHeader,
    IWidgetDescription,
} from "./types/widgetTypes.js";

export {
    type BrokenAlertType,
    type IBrokenAlertFilterBasicInfo,
    type BrokenAlertDateFilterInfo,
    type BrokenAlertAttributeFilterInfo,
    isBrokenAlertDateFilterInfo,
    isBrokenAlertAttributeFilterInfo,
} from "./types/alertTypes.js";

export type {
    ICsvExportConfig,
    IExportConfig,
    IXlsxExportConfig,
    IPdfExportConfig,
} from "./types/exportTypes.js";

export type {
    IConnectingAttribute,
    IDashboardAttributeFilterDisplayForms,
    IDashboardAttributeFilterParentItem,
    IParentWithConnectingAttributes,
    IUseAttributeElements,
} from "./types/attributeFilterTypes.js";

export {
    type IDashboardDependentDateFilter,
    isDashboardDependentDateFilter,
} from "./types/dateFilterTypes.js";

export { DRILL_TO_URL_PLACEHOLDER } from "./types/drillTypes.js";
export type {
    DashboardAccessibilityLimitation,
    IInaccessibleDashboard,
} from "./types/inaccessibleDashboardTypes.js";

export * from "./react/index.js";
export * from "./commands/index.js";
export * from "./events/index.js";
export * from "./queries/index.js";
export * from "./store/index.js";

export {
    selectDateDatasetsForInsight,
    selectInsightAttributesMeta,
    selectDateDatasetsForMeasure,
    type selectDateDatasetsForInsightType,
    type selectInsightAttributesMetaType,
    type selectDateDatasetsForMeasureType,
} from "./queryServices/index.js";

export type { IRenderingWorkerConfiguration } from "./commandHandlers/render/types.js";
export {
    type DashboardEventHandler,
    type DashboardEventHandlerFn,
    type DashboardEventEvalFn,
    anyEventHandler,
    anyDashboardEventHandler,
    singleEventTypeHandler,
    commandStartedEventHandler,
    commandFailedEventHandler,
} from "./eventHandlers/eventHandler.js";
export { newDrillToSameDashboardHandler } from "./eventHandlers/drillToSameDashboardHandlerFactory.js";
export * from "./headlessDashboard/index.js";

export { isTemporaryIdentity, getWidgetTitle } from "./utils/dashboardItemUtils.js";
export { existBlacklistHierarchyPredicate } from "./utils/attributeHierarchyUtils.js";
export { removeDateFilters, removeIgnoredWidgetFilters } from "./utils/widgetFilters.js";
export { getAuthor } from "./utils/author.js";
