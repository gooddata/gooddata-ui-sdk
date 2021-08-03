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

export { DashboardDispatch } from "./state/dashboardStore";
export { DashboardState } from "./state/types";

export { selectDashboardLoading } from "./state/loading/loadingSelectors";
export { LoadingState } from "./state/loading/loadingState";
export { BackendCapabilitiesState } from "./state/backendCapabilities/backendCapabilitiesState";
export { selectBackendCapabilities } from "./state/backendCapabilities/backendCapabilitiesSelectors";
export { ConfigState } from "./state/config/configState";
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
} from "./state/config/configSelectors";
export { PermissionsState } from "./state/permissions/permissionsState";
export {
    selectPermissions,
    selectCanListUsersInWorkspace,
    selectCanManageWorkspace,
} from "./state/permissions/permissionsSelectors";
export { FilterContextState } from "./state/filterContext/filterContextState";
export {
    selectFilterContext,
    selectFilterContextFilters,
    selectFilterContextDateFilter,
    selectFilterContextAttributeFilters,
} from "./state/filterContext/filterContextSelectors";

export { UndoEnhancedState, UndoEntry } from "./state/_infra/undoEnhancer";
export { LayoutState, LayoutStash } from "./state/layout/layoutState";
export {
    selectLayout,
    selectStash,
    selectBasicLayout,
    selectWidgetByRef,
    selectWidgetsMap,
} from "./state/layout/layoutSelectors";
export { DateFilterConfigState } from "./state/dateFilterConfig/dateFilterConfigState";
export {
    selectDateFilterConfigOverrides,
    selectEffectiveDateFilterConfig,
    selectEffectiveDateFilterTitle,
    selectEffectiveDateFilterMode,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterAvailableGranularities,
} from "./state/dateFilterConfig/dateFilterConfigSelectors";
export {
    selectInsights,
    selectInsightRefs,
    selectInsightsMap,
    selectInsightByRef,
} from "./state/insights/insightsSelectors";
export { CatalogState } from "./state/catalog/catalogState";
export {
    selectAttributesWithDrillDown,
    selectCatalogAttributes,
    selectCatalogAttributeDisplayForms,
    selectCatalogDateDatasets,
    selectCatalogFacts,
    selectCatalogMeasures,
    selectAllCatalogAttributesMap,
    selectAllCatalogDisplayFormsMap,
} from "./state/catalog/catalogSelectors";
export { AlertsState } from "./state/alerts/alertsState";
export { selectAlerts } from "./state/alerts/alertsSelectors";
export { UserState } from "./state/user/userState";
export { selectUser } from "./state/user/userSelectors";
export { DashboardMeta, DashboardMetaState } from "./state/meta/metaState";
export { selectDashboardRef, selectDashboardUriRef, selectDashboardTitle } from "./state/meta/metaSelectors";
export { selectListedDashboards } from "./state/listedDashboards/listedDashboardsSelectors";
export {
    selectDrillTargetsByWidgetRef,
    selectDrillTargets,
} from "./state/drillTargets/drillTargetsSelectors";
export { IDrillTargets } from "./state/drillTargets/drillTargetsTypes";

export { selectDateDatasetsForInsight } from "./queryServices/queryInsightDateDatasets";
export { selectInsightAttributesMeta } from "./queryServices/queryInsightAttributesMeta";

export {
    DashboardContext,
    ObjectAvailabilityConfig,
    DashboardConfig,
    ResolvedDashboardConfig,
} from "./types/commonTypes";
export {
    ExtendedDashboardItem,
    ExtendedDashboardWidget,
    InsightPlaceholderWidget,
    KpiPlaceholderWidget,
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

export * from "./commands";
export * from "./events";
export * from "./queries";
export * from "./react";
export { DashboardEventHandler } from "./events/eventHandler";
export { newDrillToSameDashboardHandler } from "./eventHandlers/drillToSameDashboardHandlerFactory";
