// (C) 2019 GoodData Corporation

export {
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    BackendCapabilities,
    AnalyticalBackendConfig,
    AnalyticalBackendFactory,
    prepareExecution,
    IAuthenticationProvider,
    AuthenticationContext,
    AuthenticatedPrincipal,
} from "./backend";

export {
    IExecutionFactory,
    AbstractExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
} from "./workspace/execution";

export { DataViewFacade } from "./workspace/execution/facade";

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
} from "./workspace/execution/results";

export { IWorkspaceSettingsService, IWorkspaceSettings } from "./workspace/settings";

export { IWorkspaceMetadata, IInsightQueryOptions, IInsightQueryResult } from "./workspace/insights";

export {
    IWorkspaceCatalog,
    ILoadCatalogGroupsOptions,
    ILoadCatalogItemsOptions,
    ILoadAvailableCatalogItemsOptions,
} from "./workspace/ldm/catalog";

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

export { IWorkspaceDataSetsService } from "./workspace/ldm/dataSets";

export { IWorkspaceQuery, IWorkspaceQueryFactory, IWorkspaceQueryResult } from "./workspace";
