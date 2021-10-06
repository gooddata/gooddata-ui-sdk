// (C) 2021 GoodData Corporation

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
    DashboardDispatch,
    DashboardState,
    DashboardSelector,
    DashboardSelectorEvaluator,
} from "./store/types";

export { selectDashboardLoading } from "./store/loading/loadingSelectors";
export { LoadingState } from "./store/loading/loadingState";
export { selectDashboardSaving, selectIsDashboardSaving } from "./store/saving/savingSelectors";
export { SavingState } from "./store/saving/savingState";
export { BackendCapabilitiesState } from "./store/backendCapabilities/backendCapabilitiesState";
export { selectBackendCapabilities } from "./store/backendCapabilities/backendCapabilitiesSelectors";
export { ConfigState } from "./store/config/configState";
export {
    selectConfig,
    selectLocale,
    selectSeparators,
    selectSettings,
    selectColorPalette,
    selectDateFilterConfig,
    selectObjectAvailabilityConfig,
    selectIsReadOnly,
    selectMapboxToken,
    selectDateFormat,
    selectEnableKPIDashboardSchedule,
    selectEnableKPIDashboardScheduleRecipients,
    selectEnableCompanyLogoInEmbeddedUI,
    selectIsEmbedded,
    selectIsExport,
    selectPlatformEdition,
    selectDisableDefaultDrills,
    selectEnableFilterValuesResolutionInDrillEvents,
    selectEnableKPIDashboardExportPDF,
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableKPIDashboardSaveAsNew,
} from "./store/config/configSelectors";
export { PermissionsState } from "./store/permissions/permissionsState";
export {
    selectPermissions,
    selectCanListUsersInWorkspace,
    selectCanManageWorkspace,
    selectCanExportReport,
    selectCanCreateAnalyticalDashboard,
} from "./store/permissions/permissionsSelectors";
export { FilterContextState } from "./store/filterContext/filterContextState";
export {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
    selectFilterContextFilters,
    selectFilterContextDateFilter,
    selectFilterContextAttributeFilters,
    selectAttributeFilterDisplayFormsMap,
    selectAttributeFilterDisplayForms,
} from "./store/filterContext/filterContextSelectors";
export {
    // Core drills
    selectImplicitDrillsDownByWidgetRef,
    selectConfiguredDrillsByWidgetRef,
    selectDrillableItemsByWidgetRef,
    selectConfiguredAndImplicitDrillsByWidgetRef,
    // Local drills for drill dialog
    selectImplicitDrillsByAvailableDrillTargets,
    selectDrillableItemsByAvailableDrillTargets,
    IImplicitDrillWithPredicates,
} from "./store/widgetDrills/widgetDrillSelectors";

export { UndoEnhancedState, UndoEntry } from "./store/_infra/undoEnhancer";
export { LayoutState, LayoutStash } from "./store/layout/layoutState";
export {
    selectLayout,
    selectStash,
    selectWidgetByRef,
    selectWidgetsMap,
    selectAllInsightWidgets,
    selectAllKpiWidgets,
    selectIsLayoutEmpty,
    selectWidgetDrills,
} from "./store/layout/layoutSelectors";
export { DateFilterConfigState } from "./store/dateFilterConfig/dateFilterConfigState";
export {
    selectDateFilterConfigOverrides,
    selectEffectiveDateFilterConfig,
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterAvailableGranularities,
} from "./store/dateFilterConfig/dateFilterConfigSelectors";
export {
    selectInsights,
    selectInsightRefs,
    selectInsightsMap,
    selectInsightByRef,
} from "./store/insights/insightsSelectors";
export { CatalogState } from "./store/catalog/catalogState";
export {
    selectAttributesWithDrillDown,
    selectCatalogAttributes,
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
    selectCatalogFacts,
    selectCatalogMeasures,
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "./store/catalog/catalogSelectors";
export { selectDrillableItems } from "./store/drill/drillSelectors";
export { DrillState } from "./store/drill/drillState";
export { AlertsState } from "./store/alerts/alertsState";
export {
    selectAlerts,
    selectAlertByWidgetRef,
    selectAlertsMap,
    selectAlertByRef,
} from "./store/alerts/alertsSelectors";
export { UserState } from "./store/user/userState";
export { selectUser } from "./store/user/userSelectors";
export { DashboardMetaState, DashboardDescriptor } from "./store/meta/metaState";
export {
    selectDashboardRef,
    selectDashboardUriRef,
    selectDashboardTitle,
    selectDashboardDescription,
    selectDashboardIdRef,
    selectDashboardTags,
    selectDashboardUri,
    selectDashboardId,
} from "./store/meta/metaSelectors";
export {
    selectListedDashboards,
    selectListedDashboardsMap,
} from "./store/listedDashboards/listedDashboardsSelectors";
export {
    selectDrillTargetsByWidgetRef,
    selectDrillTargets,
} from "./store/drillTargets/drillTargetsSelectors";
export { IDrillTargets } from "./store/drillTargets/drillTargetsTypes";
export {
    selectExecutionResult,
    selectExecutionResultByRef,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExecutionResultReadyForExportByRef,
} from "./store/executionResults/executionResultsSelectors";
export { IExecutionResultEnvelope } from "./store/executionResults/types";
export { UiState } from "./store/ui/uiState";
export { selectIsScheduleEmailDialogOpen, selectIsSaveAsDialogOpen } from "./store/ui/uiSelectors";
export { uiActions } from "./store/ui";

export { selectDateDatasetsForInsight } from "./queryServices/queryInsightDateDatasets";
export { selectInsightAttributesMeta } from "./queryServices/queryInsightAttributesMeta";
export { selectDateDatasetsForMeasure } from "./queryServices/queryMeasureDateDatasets";

export {
    DashboardContext,
    ObjectAvailabilityConfig,
    DashboardConfig,
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
    isCustomWidgetDefinition,
    isCustomWidget,
    ExtendedDashboardItem,
    extendedWidgetDebugStr,
    ExtendedDashboardWidget,
    DashboardItemDefinition,
    StashedDashboardItemsId,
    ExtendedDashboardLayoutSection,
    RelativeIndex,
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

export * from "./commands";
export * from "./events";
export * from "./queries";
export * from "./react";
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
