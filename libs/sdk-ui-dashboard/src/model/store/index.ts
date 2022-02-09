// (C) 2021-2022 GoodData Corporation
export { DashboardDispatch, DashboardState, DashboardSelector, DashboardSelectorEvaluator } from "./types";

export { selectDashboardLoading } from "./loading/loadingSelectors";
export { LoadingState } from "./loading/loadingState";
export { selectDashboardSaving, selectIsDashboardSaving } from "./saving/savingSelectors";
export { SavingState } from "./saving/savingState";
export { BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState";
export { selectBackendCapabilities } from "./backendCapabilities/backendCapabilitiesSelectors";
export { ConfigState } from "./config/configState";
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
    selectEnableClickableAttributeURL,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToURL,
    selectEnableKPIDashboardImplicitDrillDown,
    selectHideKpiDrillInEmbedded,
} from "./config/configSelectors";
export { PermissionsState } from "./permissions/permissionsState";
export {
    selectPermissions,
    selectCanListUsersInWorkspace,
    selectCanManageWorkspace,
    selectCanExportReport,
    selectCanCreateAnalyticalDashboard,
    selectCanManageACL,
    selectCanManageAnalyticalDashboard,
    selectCanCreateScheduledMail,
} from "./permissions/permissionsSelectors";
export { FilterContextState } from "./filterContext/filterContextState";
export {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
    selectFilterContextFilters,
    selectFilterContextDateFilter,
    selectFilterContextAttributeFilters,
    selectAttributeFilterDisplayFormsMap,
    selectAttributeFilterDisplayForms,
    selectFilterContextAttributeFilterByDisplayForm,
    selectOriginalFilterContextDefinition,
    selectOriginalFilterContextFilters,
} from "./filterContext/filterContextSelectors";
export {
    // Core drills
    selectImplicitDrillsDownByWidgetRef,
    selectConfiguredDrillsByWidgetRef,
    selectDrillableItemsByWidgetRef,
    selectConfiguredAndImplicitDrillsByWidgetRef,
    selectValidConfiguredDrillsByWidgetRef,
    // Local drills for drill dialog
    selectImplicitDrillsByAvailableDrillTargets,
    selectDrillableItemsByAvailableDrillTargets,
    IImplicitDrillWithPredicates,
} from "./widgetDrills/widgetDrillSelectors";

export { UndoEnhancedState, UndoEntry } from "./_infra/undoEnhancer";
export { LayoutState, LayoutStash } from "./layout/layoutState";
export {
    selectLayout,
    selectStash,
    selectWidgetByRef,
    selectAnalyticalWidgetByRef,
    selectWidgetsMap,
    selectAllInsightWidgets,
    selectAllCustomWidgets,
    selectAllKpiWidgets,
    selectIsLayoutEmpty,
    selectWidgetDrills,
} from "./layout/layoutSelectors";
export { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState";
export {
    selectDateFilterConfigOverrides,
    selectEffectiveDateFilterConfig,
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterAvailableGranularities,
} from "./dateFilterConfig/dateFilterConfigSelectors";
export {
    selectInsights,
    selectInsightRefs,
    selectInsightsMap,
    selectInsightByRef,
} from "./insights/insightsSelectors";
export { CatalogState } from "./catalog/catalogState";
export {
    selectAttributesWithDrillDown,
    selectCatalogAttributes,
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
    selectCatalogFacts,
    selectCatalogMeasures,
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "./catalog/catalogSelectors";
export { selectDrillableItems } from "./drill/drillSelectors";
export { DrillState } from "./drill/drillState";
export { AlertsState } from "./alerts/alertsState";
export {
    selectAlerts,
    selectAlertByWidgetRef,
    selectAlertsMap,
    selectAlertByRef,
} from "./alerts/alertsSelectors";
export { UserState } from "./user/userState";
export { selectUser, selectCurrentUserRef } from "./user/userSelectors";
export { DashboardMetaState, DashboardDescriptor } from "./meta/metaState";
export {
    selectDashboardRef,
    selectDashboardUriRef,
    selectDashboardTitle,
    selectDashboardDescription,
    selectDashboardIdRef,
    selectDashboardTags,
    selectDashboardUri,
    selectDashboardId,
    selectDashboardShareStatus,
    selectDashboardShareInfo,
    selectPersistedDashboard,
    selectDashboardLockStatus,
} from "./meta/metaSelectors";
export {
    selectListedDashboards,
    selectListedDashboardsMap,
} from "./listedDashboards/listedDashboardsSelectors";
export {
    selectAccessibleDashboards,
    selectAccessibleDashboardsMap,
} from "./accessibleDashboards/accessibleDashboardsSelectors";
export { selectDrillTargetsByWidgetRef, selectDrillTargets } from "./drillTargets/drillTargetsSelectors";
export { IDrillTargets } from "./drillTargets/drillTargetsTypes";
export {
    selectExecutionResult,
    selectExecutionResultByRef,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExecutionResultReadyForExportByRef,
} from "./executionResults/executionResultsSelectors";
export { IExecutionResultEnvelope } from "./executionResults/types";
export { UiState } from "./ui/uiState";
export {
    selectIsScheduleEmailDialogOpen,
    selectIsSaveAsDialogOpen,
    selectIsShareDialogOpen,
    selectFilterBarExpanded,
    selectFilterBarHeight,
    selectIsKpiAlertOpenedByWidgetRef,
    selectIsKpiAlertHighlightedByWidgetRef,
    selectMenuButtonItemsVisibility,
} from "./ui/uiSelectors";
export { uiActions } from "./ui";

export { queryAndWaitFor } from "./_infra/queryAndWaitFor";
export { dispatchAndWaitFor } from "./_infra/dispatchAndWaitFor";
export {
    IDashboardQueryService,
    QueryCache,
    QueryActions,
    QueryCacheEntry,
    QueryCacheEntryResult,
    AllQueryCacheReducers,
    QueryCacheReducer,
} from "./_infra/queryService";
export {
    DashboardStoreAccessor,
    DashboardStoreAccessorRepository,
    SingleDashboardStoreAccessor,
} from "./storeAccessors";
