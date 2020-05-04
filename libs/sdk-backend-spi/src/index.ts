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
export {
    IDashboard,
    IDashboardDefinition,
    IDateFilterConfig,
    IListedDashboard,
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
} from "./workspace/dashboards/layout";
export { IWidget, IWidgetDefinition, WidgetType } from "./workspace/dashboards/widget";
export { IWidgetAlert, IWidgetAlertDefinition } from "./workspace/dashboards/alert";
export {
    AbsoluteDateFilterOption,
    AbsoluteFormType,
    AbsolutePresetType,
    AllTimeType,
    DateFilterConfigMode,
    DateFilterGranularity,
    DateFilterOption,
    DateFilterRelativeOptionGroup,
    DateString,
    GUID,
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
} from "./workspace/dashboards/extendedDateFilters";
export {
    IDashboardAttachment,
    IScheduledMail,
    IScheduledMailDefinition,
    ScheduledMailAttachment,
} from "./workspace/dashboards/scheduledMail";
