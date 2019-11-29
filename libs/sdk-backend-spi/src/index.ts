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
} from "./execution";

export { DataViewFacade } from "./execution/facade";

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
} from "./execution/results";

export { IWorkspaceSettingsService, IWorkspaceSettings } from "./featureFlags";

export { IWorkspaceMetadata } from "./metadata";

export {
    IWorkspaceCatalog,
    ILoadCatalogGroupsOptions,
    ILoadCatalogItemsOptions,
    ILoadAvailableCatalogItemsOptions,
} from "./catalog";

export { IElementQueryFactory, IElementQueryResult, IElementQuery, IElementQueryOptions } from "./elements";

export { IExportConfig, IExportResult } from "./export";

export { IWorkspaceStylingService } from "./styling";

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
