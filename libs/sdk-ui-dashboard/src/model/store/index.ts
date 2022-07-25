// (C) 2021-2022 GoodData Corporation
export { DashboardDispatch, DashboardState, DashboardSelector, DashboardSelectorEvaluator } from "./types";

export { selectDashboardLoading, selectIsDashboardLoading } from "./loading/loadingSelectors";
export { LoadingState } from "./loading/loadingState";
export { selectDashboardSaving, selectIsDashboardSaving } from "./saving/savingSelectors";
export { SavingState } from "./saving/savingState";
export { BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState";
export {
    selectBackendCapabilities,
    selectSupportsElementsQueryParentFiltering,
    selectSupportsElementUris,
} from "./backendCapabilities/backendCapabilitiesSelectors";
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
    selectEnableInsightExportScheduling,
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
    selectEnableWidgetCustomHeight,
    selectEnableRenamingProjectToWorkspace,
    selectEnableRenamingMeasureToMetric,
    selectShouldHidePixelPerfectExperience,
    selectDisableKpiDashboardHeadlineUnderline,
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
    selectCanInitData,
    selectCanUploadNonProductionCSV,
    selectCanExecuteRaw,
    selectCanCreateVisualization,
    selectCanManageMetric,
    selectCanManageDomain,
    selectCanInviteUserToWorkspace,
    selectCanRefreshData,
    selectCanManageScheduledMail,
} from "./permissions/permissionsSelectors";
export { FilterContextState } from "./filterContext/filterContextState";
export {
    selectFilterContextDefinition,
    selectFilterContextIdentity,
    selectFilterContextFilters,
    selectFilterContextDateFilter,
    selectFilterContextAttributeFilters,
    selectOtherContextAttributeFilters,
    selectAttributeFilterDisplayFormsMap,
    selectAttributeFilterDisplayForms,
    selectFilterContextAttributeFilterByDisplayForm,
    selectOriginalFilterContextDefinition,
    selectOriginalFilterContextFilters,
    selectFiltersToIndexMap,
    selectConnectingAttributesMatrix,
    selectAttributeFilterDescendants,
    selectAttributeFilterDisplayFormByLocalId,
    selectIsCircularDependency,
    selectConnectingAttributesForFilters,
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
export { selectLegacyDashboards } from "./legacyDashboards/legacyDashboardsSelectors";

export { UndoEnhancedState, UndoEntry } from "./_infra/undoEnhancer";
export { LayoutState, LayoutStash } from "./layout/layoutState";
export {
    selectLayout,
    selectStash,
    selectWidgetByRef,
    selectAnalyticalWidgetByRef,
    selectWidgets,
    selectWidgetsMap,
    selectAllInsightWidgets,
    selectAllCustomWidgets,
    selectAllKpiWidgets,
    selectIsLayoutEmpty,
    selectWidgetDrills,
    selectWidgetCoordinatesByRef,
} from "./layout/layoutSelectors";
export { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState";
export {
    selectDateFilterConfigOverrides,
    selectEffectiveDateFilterConfig,
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterAvailableGranularities,
    selectDateFilterConfigValidationWarnings,
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
    selectAllCatalogDateDatasetsMap,
    selectAllCatalogMeasuresMap,
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
export { selectCurrentUser, selectCurrentUserRef } from "./user/userSelectors";
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
    selectIsNewDashboard,
} from "./meta/metaSelectors";
export { metaActions } from "./meta";
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
    selectIsScheduleEmailManagementDialogOpen,
    selectIsSaveAsDialogOpen,
    selectIsShareDialogOpen,
    selectFilterBarExpanded,
    selectFilterBarHeight,
    selectIsKpiAlertOpenedByWidgetRef,
    selectIsKpiAlertHighlightedByWidgetRef,
    selectMenuButtonItemsVisibility,
    selectScheduleEmailDialogDefaultAttachment,
    selectRenderMode,
    selectIsInEditMode,
    selectIsInViewMode,
    selectSelectedWidgetRef,
    selectConfigurationPanelOpened,
} from "./ui/uiSelectors";
export { uiActions } from "./ui";
export { LegacyDashboardsState } from "./legacyDashboards/legacyDashboardsState";

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
