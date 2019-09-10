// (C) 2019 GoodData Corporation

export { IAnalyticalBackend, IAnalyticalWorkspace, BackendCapabilities } from "./backend";

export {
    IExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
    IExecutionDefinition,
} from "./execution";

export { DataViewFacade } from "./execution/facade";

export {
    DataValue,
    IMeasureHeaderItem,
    IHeader,
    IResultDimension,
    IAttributeHeader,
    IMeasureGroupHeader,
    IResultAttributeHeaderItem,
    IResultHeaderItem,
    IResultMeasureHeaderItem,
    IResultTotalHeaderItem,
    ITotalHeaderItem,
} from "./execution/results";

export { IFeatureFlagsQuery, IFeatureFlags } from "./featureFlags";

export { IWorkspaceMetadata } from "./metadata";

export { IElementQueryFactory, IElementQueryResult, IElementQuery, Element } from "./elements";

export { IExportConfig, IExportResult } from "./export";

export { IWorkspaceStyling } from "./styling";

export {
    AnalyticalBackendError,
    DataViewError,
    ExecutionError,
    isAnalyticalBackendError,
    isDataViewError,
    isExecutionError,
    isNotSupported,
    isNotImplemented,
} from "./errors";
