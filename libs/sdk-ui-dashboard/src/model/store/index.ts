// (C) 2021-2023 GoodData Corporation
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
    selectSupportsKpiWidgetCapability,
    selectSupportsAccessControlCapability,
    selectSupportsHierarchicalWorkspacesCapability,
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
    selectIsWhiteLabeled,
    selectEnableAnalyticalDashboardPermissions,
    selectIsSaveAsNewButtonHidden,
    selectAllowUnfinishedFeatures,
    selectDashboardEditModeDevRollout,
    selectIsAnalyticalDesignerEnabled,
    selectIsDeleteFilterButtonEnabled,
    selectIsKPIDashboardDependentFiltersEnabled,
    selectIsAlternativeDisplayFormSelectionEnabled,
    selectEnableKPIDashboardDrillFromAttribute,
    selectIsShareButtonHidden,
} from "./config/configSelectors";
export { PermissionsState } from "./permissions/permissionsState";
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
} from "./permissions/permissionsSelectors";
export { DashboardPermissionsState } from "./dashboardPermissions/dashboardPermissionsState";
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
    selectAttributeFilterDescendants,
    selectAttributeFilterDisplayFormByLocalId,
    selectIsCircularDependency,
    selectCanAddMoreAttributeFilters,
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
    selectImplicitDrillsToUrlByWidgetRef,
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
    selectHasCatalogAttributes,
    selectHasCatalogMeasures,
    selectHasCatalogDateDatasets,
    selectHasCatalogFacts,
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
    selectIsDashboardDirty,
    selectIsDashboardPrivate,
    selectDashboardWorkingDefinition,
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
export { UiState, InvalidCustomUrlDrillParameterInfo } from "./ui/uiState";
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
} from "./ui/uiSelectors";
export { uiActions } from "./ui";
export { RenderModeState } from "./renderMode/renderModeState";
export { selectIsInEditMode, selectIsInViewMode, selectRenderMode } from "./renderMode/renderModeSelectors";
export { renderModeActions } from "./renderMode";
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
