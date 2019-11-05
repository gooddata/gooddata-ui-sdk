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

export { IExecutionFactory, IPreparedExecution, IExecutionResult, IDataView } from "./execution";

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
    IElementQueryFactory,
    IElementQueryResult,
    IElementQuery,
    IElement,
    IElementQueryOptions,
} from "./elements";

export { IExportConfig, IExportResult } from "./export";

export { IWorkspaceStylingService } from "./styling";

export {
    AnalyticalBackendError,
    DataViewError,
    ExecutionError,
    NotSupported,
    NotImplemented,
    NotAuthenticated,
    isAnalyticalBackendError,
    isDataViewError,
    isExecutionError,
    isNotSupported,
    isNotImplemented,
    isNotAuthenticated,
} from "./errors";
