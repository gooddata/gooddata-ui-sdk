// (C) 2021-2023 GoodData Corporation
export { DashboardDispatch, DashboardState, DashboardSelector, DashboardSelectorEvaluator } from "./types.js";

export { selectDashboardLoading, selectIsDashboardLoading } from "./loading/loadingSelectors.js";
export { LoadingState } from "./loading/loadingState.js";
export { selectDashboardSaving, selectIsDashboardSaving } from "./saving/savingSelectors.js";
export { SavingState } from "./saving/savingState.js";
export { BackendCapabilitiesState } from "./backendCapabilities/backendCapabilitiesState.js";
export {
    selectBackendCapabilities,
    selectSupportsElementsQueryParentFiltering,
    selectSupportsElementUris,
    selectSupportsKpiWidgetCapability,
    selectSupportsAccessControlCapability,
    selectSupportsHierarchicalWorkspacesCapability,
} from "./backendCapabilities/backendCapabilitiesSelectors.js";
export { ConfigState } from "./config/configState.js";
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
    selectIsWhiteLabeled,
    selectEnableAnalyticalDashboardPermissions,
    selectIsSaveAsNewButtonHidden,
    selectAllowUnfinishedFeatures,
    selectAllowCreateInsightRequest,
    selectIsAnalyticalDesignerEnabled,
    selectIsDeleteFilterButtonEnabled,
    selectIsKPIDashboardDependentFiltersEnabled,
    selectIsAlternativeDisplayFormSelectionEnabled,
    selectEnableKPIDashboardDrillFromAttribute,
    selectIsShareButtonHidden,
    selectWeekStart,
} from "./config/configSelectors.js";
export { EntitlementsState } from "./entitlements/entitlementsState.js";
export { selectEntitlementExportPdf } from "./entitlements/entitlementsSelectors.js";

export { PermissionsState } from "./permissions/permissionsState.js";
export {
    selectPermissions,
    selectCanListUsersInWorkspace,
    selectCanManageWorkspace,
    selectCanExportReport,
    selectCanExportTabular,
    selectCanExportPdf,
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
} from "./permissions/permissionsSelectors.js";
export { DashboardPermissionsState } from "./dashboardPermissions/dashboardPermissionsState.js";
export {
    selectCanViewDashboardPermission,
    selectCanShareDashboardPermission,
    selectCanShareLockedDashboardPermission,
    selectCanEditDashboardPermission,
    selectCanEditLockedDashboardPermission,
    selectDashboardPermissions,
} from "./dashboardPermissions/dashboardPermissionsSelectors.js";
export { FilterContextState } from "./filterContext/filterContextState.js";
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
    selectAttributeFilterDescendants,
    selectAttributeFilterDisplayFormByLocalId,
    selectIsCircularDependency,
    selectCanAddMoreAttributeFilters,
} from "./filterContext/filterContextSelectors.js";
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
    selectImplicitDrillsToUrlByWidgetRef,
    IImplicitDrillWithPredicates,
} from "./widgetDrills/widgetDrillSelectors.js";
export { selectLegacyDashboards } from "./legacyDashboards/legacyDashboardsSelectors.js";

export { UndoEnhancedState, UndoEntry } from "./_infra/undoEnhancer.js";
export { LayoutState, LayoutStash } from "./layout/layoutState.js";
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
    selectAllAnalyticalWidgets,
    selectIsLayoutEmpty,
    selectLayoutHasAnalyticalWidgets,
    selectWidgetDrills,
    selectWidgetCoordinatesByRef,
    selectWidgetPlaceholder,
    selectWidgetPlaceholderCoordinates,
    selectInsightWidgetPlaceholder,
    selectInsightWidgetPlaceholderCoordinates,
    selectKpiWidgetPlaceholder,
    selectKpiWidgetPlaceholderCoordinates,
} from "./layout/layoutSelectors.js";
export { DateFilterConfigState } from "./dateFilterConfig/dateFilterConfigState.js";
export {
    selectDateFilterConfigOverrides,
    selectEffectiveDateFilterConfig,
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterAvailableGranularities,
    selectDateFilterConfigValidationWarnings,
} from "./dateFilterConfig/dateFilterConfigSelectors.js";
export {
    selectInsights,
    selectInsightRefs,
    selectInsightsMap,
    selectInsightByRef,
} from "./insights/insightsSelectors.js";
export { CatalogState } from "./catalog/catalogState.js";
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
    selectHasCatalogAttributes,
    selectHasCatalogMeasures,
    selectHasCatalogDateDatasets,
    selectHasCatalogFacts,
} from "./catalog/catalogSelectors.js";
export { selectDrillableItems } from "./drill/drillSelectors.js";
export { DrillState } from "./drill/drillState.js";
export { AlertsState } from "./alerts/alertsState.js";
export {
    selectAlerts,
    selectAlertByWidgetRef,
    selectAlertsMap,
    selectAlertByRef,
} from "./alerts/alertsSelectors.js";
export { UserState } from "./user/userState.js";
export { selectCurrentUser, selectCurrentUserRef } from "./user/userSelectors.js";
export { DashboardMetaState, DashboardDescriptor } from "./meta/metaState.js";
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
    selectIsDashboardDirty,
    selectIsDashboardPrivate,
    selectDashboardWorkingDefinition,
} from "./meta/metaSelectors.js";
export {
    selectListedDashboards,
    selectListedDashboardsMap,
} from "./listedDashboards/listedDashboardsSelectors.js";
export {
    selectAccessibleDashboards,
    selectAccessibleDashboardsMap,
} from "./accessibleDashboards/accessibleDashboardsSelectors.js";
export {
    selectInaccessibleDashboards,
    selectInaccessibleDashboardsMap,
} from "./inaccessibleDashboards/inaccessibleDashboardsSelectors.js";
export { selectDrillTargetsByWidgetRef, selectDrillTargets } from "./drillTargets/drillTargetsSelectors.js";
export { IDrillTargets } from "./drillTargets/drillTargetsTypes.js";
export {
    selectExecutionResult,
    selectExecutionResultByRef,
    selectIsExecutionResultExportableToCsvByRef,
    selectIsExecutionResultExportableToXlsxByRef,
    selectIsExecutionResultReadyForExportByRef,
} from "./executionResults/executionResultsSelectors.js";
export { IExecutionResultEnvelope } from "./executionResults/types.js";
export { UiState, InvalidCustomUrlDrillParameterInfo } from "./ui/uiState.js";
export {
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectIsSaveAsDialogOpen,
    selectIsShareDialogOpen,
    selectFilterBarExpanded,
    selectIsKpiAlertOpenedByWidgetRef,
    selectIsKpiAlertHighlightedByWidgetRef,
    selectMenuButtonItemsVisibility,
    selectScheduleEmailDialogDefaultAttachment,
    selectSelectedWidgetRef,
    selectConfigurationPanelOpened,
    selectWidgetDateDatasetAutoSelect,
    selectIsDeleteDialogOpen,
    selectIsKpiDeleteDialogOpen,
    selectKpiDeleteDialogWidgetCoordinates,
    selectInsightListLastUpdateRequested,
    selectIsWidgetLoadingAdditionalDataByWidgetRef,
    selectIsFilterAttributeSelectionOpen,
    selectSelectedFilterIndex,
    selectIsDraggingWidget,
    selectActiveSectionIndex,
    selectIsCancelEditModeDialogOpen,
    selectDraggingWidgetSource,
    selectDraggingWidgetTarget,
    selectWidgetsOverlay,
    selectWidgetsOverlayState,
    selectWidgetsModification,
    selectSectionModification,
    selectIsSectionInsertedByPlugin,
    selectInvalidDrillWidgetRefs,
    selectInvalidUrlDrillParameterDrillLocalIdsByWidgetRef,
    selectInvalidUrlDrillParameterWidgetRefs,
    selectInvalidUrlDrillParameterWidgetWarnings,
} from "./ui/uiSelectors.js";
export { uiActions } from "./ui/index.js";
export { RenderModeState } from "./renderMode/renderModeState.js";
export {
    selectIsInEditMode,
    selectIsInViewMode,
    selectRenderMode,
} from "./renderMode/renderModeSelectors.js";
export { renderModeActions } from "./renderMode/index.js";
export { LegacyDashboardsState } from "./legacyDashboards/legacyDashboardsState.js";

export { queryAndWaitFor } from "./_infra/queryAndWaitFor.js";
export { dispatchAndWaitFor } from "./_infra/dispatchAndWaitFor.js";
export {
    IDashboardQueryService,
    QueryCache,
    QueryActions,
    QueryCacheEntry,
    QueryCacheEntryResult,
    AllQueryCacheReducers,
    QueryCacheReducer,
} from "./_infra/queryService.js";
export {
    DashboardStoreAccessor,
    DashboardStoreAccessorRepository,
    SingleDashboardStoreAccessor,
} from "./storeAccessors/index.js";
