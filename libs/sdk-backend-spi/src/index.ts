// (C) 2019-2020 GoodData Corporation

export {
    IAnalyticalBackend,
    IBackendCapabilities,
    IAnalyticalBackendConfig,
    AnalyticalBackendFactory,
    prepareExecution,
} from "./backend";

export { IAuthenticatedPrincipal, IAuthenticationContext, IAuthenticationProvider } from "./auth";

export { ISettings, IUserSettings, IWorkspaceSettings, IUserWorkspaceSettings } from "./common/settings";

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
    IResultWarning,
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
    IGetVisualizationClassesOptions,
    IWorkspaceInsightsService,
    InsightOrdering,
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    InsightReferenceTypes,
    SupportedInsightReferenceTypes,
} from "./workspace/insights";

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
    IElementsQueryFactory,
    IElementsQueryResult,
    IElementsQuery,
    IElementsQueryOptions,
    IElementsQueryAttributeFilter,
} from "./workspace/attributes/elements";

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
    IWorkspacesQuery,
    IWorkspacesQueryFactory,
    IWorkspacesQueryResult,
    IWorkspaceDescriptor,
} from "./workspace";

export { IWorkspacePermissionsService } from "./workspace/permissions";

export { IWorkspaceAttributesService } from "./workspace/attributes";

export { IWorkspaceMeasuresService } from "./workspace/measures";

export { IWorkspaceFactsService } from "./workspace/facts";

export { IWorkspaceDashboardsService } from "./workspace/dashboards";
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
    IDrillToAttributeUrl,
    isDrillToAttributeUrl,
    IDrillToCustomUrl,
    isDrillToCustomUrl,
    IDrillTarget,
    IDrillToAttributeUrlTarget,
    IDrillToCustomUrlTarget,
} from "./workspace/dashboards/drills";
export {
    IDashboard,
    IDashboardDefinition,
    IListedDashboard,
    IDashboardBase,
    IDashboardDateFilterConfig,
    DashboardDateFilterConfigMode,
    IDashboardDateFilterAddedPresets,
} from "./workspace/dashboards/dashboard";
export {
    IFilterContext,
    AbsoluteType,
    DateFilterType,
    FilterContextItem,
    IDashboardAttributeFilterParent,
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
    IFilterContextBase,
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
    IWidgetReferences,
    SupportedWidgetReferenceTypes,
    widgetUri,
    widgetType,
    IWidgetBase,
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
    IScheduledMailBase,
} from "./workspace/dashboards/scheduledMail";
export { IWorkspaceUser, IWorkspaceUsersQuery, IWorkspaceUsersQueryOptions } from "./workspace/users";
export { IDateFilterConfigsQuery, IDateFilterConfigsQueryResult } from "./workspace/dateFilterConfigs";
export {
    IDateFilterConfig,
    AbsoluteFormType,
    AbsolutePresetType,
    AllTimeType,
    DateFilterGranularity,
    DateString,
    IAbsoluteDateFilterForm,
    IAbsoluteDateFilterPreset,
    IAllTimeDateFilterOption,
    IDateFilterOption,
    IRelativeDateFilterForm,
    IRelativeDateFilterPreset,
    IRelativeDateFilterPresetOfGranularity,
    OptionType,
    RelativeFormType,
    RelativeGranularityOffset,
    RelativePresetType,
    isAbsoluteDateFilterForm,
    isAbsoluteDateFilterPreset,
    isAllTimeDateFilterOption,
    isRelativeDateFilterForm,
    isRelativeDateFilterPreset,
} from "./workspace/dateFilterConfigs/types";
