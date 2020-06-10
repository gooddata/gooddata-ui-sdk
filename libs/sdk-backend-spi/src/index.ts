// (C) 2019-2020 GoodData Corporation

export {
    IAnalyticalBackend,
    BackendCapabilities,
    AnalyticalBackendConfig,
    AnalyticalBackendFactory,
    prepareExecution,
} from "./backend";

export { AuthenticatedPrincipal, AuthenticationContext, IAuthenticationProvider } from "./auth";

export {
    ISettings,
    SettingCatalog,
    IUserSettings,
    IWorkspaceSettings,
    IUserWorkspaceSettings,
} from "./common/settings";

export { IUserService } from "./user";
export { IUserSettingsService } from "./user/settings";

export { IExecutionFactory, IPreparedExecution, IExecutionResult, IDataView } from "./workspace/execution";

export {
    DataValue,
    IMeasureDescriptor,
    IDimensionItemDescriptor,
    IDimensionDescriptor,
    IAttributeDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
    ITotalDescriptor,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
    isTotalDescriptor,
    isMeasureDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
    resultHeaderName,
    attributeDescriptorLocalId,
    attributeDescriptorName,
} from "./workspace/execution/results";

export { IWorkspaceSettingsService } from "./workspace/settings";

export {
    IWorkspaceInsights,
    InsightOrdering,
    IInsightQueryOptions,
    IInsightQueryResult,
    IInsightReferences,
    InsightReferenceTypes,
    SupportedInsightReferenceTypes,
} from "./workspace/insights";

export { IWorkspaceMetadata } from "./workspace/metadata";

export {
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceCatalogWithAvailableItems,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    IWorkspaceCatalogFactoryMethods,
    IWorkspaceCatalogMethods,
} from "./workspace/ldm/catalog";

export { IWorkspaceDatasetsService } from "./workspace/ldm/datasets";

export {
    IElementQueryFactory,
    IElementQueryResult,
    IElementQuery,
    IElementQueryOptions,
} from "./workspace/elements";

export { IExportConfig, IExportResult } from "./workspace/execution/export";

export { IWorkspaceStylingService } from "./workspace/styling";

export {
    AnalyticalBackendError,
    NoDataError,
    DataTooLargeError,
    ProtectedDataError,
    UnexpectedResponseError,
    UnexpectedError,
    NotSupported,
    NotImplemented,
    NotAuthenticated,
    ErrorConverter,
    isAnalyticalBackendError,
    isNoDataError,
    isDataTooLargeError,
    isProtectedDataError,
    isUnexpectedResponseError,
    isUnexpectedError,
    isNotSupported,
    isNotImplemented,
    isNotAuthenticated,
    AnalyticalBackendErrorTypes,
} from "./errors";

export { IPagedResource } from "./common/paging";

export {
    IAnalyticalWorkspace,
    IWorkspaceQuery,
    IWorkspaceQueryFactory,
    IWorkspaceQueryResult,
} from "./workspace";

export { IWorkspacePermissionsFactory, IWorkspaceUserPermissions } from "./workspace/permissions";

export { IWorkspaceDashboards } from "./workspace/dashboards";
export { IDashboardObjectIdentity } from "./workspace/dashboards/common";
export {
    DrillDefinition,
    DrillOrigin,
    DrillOriginType,
    DrillTransition,
    DrillType,
    IDrill,
    IDrillFromMeasure,
    IDrillOrigin,
    IDrillToDashboard,
    IDrillToInsight,
    IDrillToLegacyDashboard,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
} from "./workspace/dashboards/drills";
export {
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    IDashboardBase,
    IDashboardDateFilterConfig,
} from "./workspace/dashboards/dashboard";
export {
    IFilterContext,
    AbsoluteType,
    DateFilterType,
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    IFilterContextDefinition,
    RelativeType,
    ITempFilterContext,
    isFilterContext,
    isFilterContextDefinition,
    isTempFilterContext,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    IDashboardFilterReference,
    IDashboardAttributeFilterReference,
    IDashboardDateFilterReference,
    isDashboardAttributeFilterReference,
    isDashboardDateFilterReference,
} from "./workspace/dashboards/filterContext";
export {
    Layout,
    LayoutContent,
    ILayoutWidget,
    IFluidLayout,
    IFluidLayoutColSize,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSize,
    ISectionDescription,
    ISectionHeader,
    SectionHeader,
    Widget,
    isLayoutWidget,
    isFluidLayout,
    layoutWidgets,
    isFluidLayoutDefinition,
    IFluidLayoutColumnDefinition,
    IFluidLayoutDefinition,
    IFluidLayoutRowDefinition,
    ILayoutWidgetDefinition,
    LayoutDefinition,
    LayoutDefinitionContent,
    LayoutWidgetDefinition,
    isLayoutWidgetDefinition,
    walkLayout,
    layoutWidgetsWithPaths,
    IWidgetDefinitionWithLayoutPath,
    IWidgetOrDefinitionWithLayoutPath,
    IWidgetWithLayoutPath,
    LayoutPath,
} from "./workspace/dashboards/layout";
export {
    IWidget,
    IWidgetDefinition,
    WidgetType,
    isWidget,
    isWidgetDefinition,
} from "./workspace/dashboards/widget";
export {
    ILegacyKpi,
    ILegacyKpiBase,
    ILegacyKpiComparisonDirection,
    ILegacyKpiComparisonTypeComparison,
    ILegacyKpiComparisonTypeNoComparison,
    ILegacyKpiWithComparison,
    ILegacyKpiWithoutComparison,
    isLegacyKpiWithComparison,
    isLegacyKpiWithoutComparison,
} from "./workspace/dashboards/kpi";
export {
    IWidgetAlertBase,
    IWidgetAlert,
    IWidgetAlertDefinition,
    IWidgetAlertCount,
    isWidgetAlert,
    isWidgetAlertDefinition,
} from "./workspace/dashboards/alert";
export {
    IDashboardAttachment,
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
} from "./workspace/dashboards/scheduledMail";
export { IWorkspaceUser, IWorkspaceUsersQuery, IWorkspaceUsersQueryOptions } from "./workspace/users";
export {
    IWorkspaceDateFilterConfigsQuery,
    IDateFilterConfigsQueryResult,
} from "./workspace/dateFilterConfigs";
export {
    IDateFilterConfig,
    AbsoluteDateFilterOption,
    AbsoluteFormType,
    AbsolutePresetType,
    AllTimeType,
    DateFilterConfigMode,
    DateFilterGranularity,
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    DateString,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IAllTimeDateFilter,
    IDashboardAddedPresets,
    IDateFilterOption,
    IDateFilterOptionsByType,
    IExtendedDateFilterErrors,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    OptionType,
    RelativeDateFilterOption,
    RelativeFormType,
    RelativeGranularityOffset,
    RelativePresetType,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterOption,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilter,
    isRelativeDateFilterForm,
    isRelativeDateFilterOption,
    isRelativeDateFilterPreset,
} from "./workspace/dateFilterConfigs/types";
