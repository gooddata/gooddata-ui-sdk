// (C) 2019 GoodData Corporation

export {
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    BackendCapabilities,
    AnalyticalBackendConfig,
    AnalyticalBackendFactory,
    prepareExecution,
} from "./backend";

export {
    IExecutionFactory,
    IPreparedExecution,
    IExecutionResult,
    IDataView,
    DimensionGenerator,
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
    isAttributeHeader,
    isMeasureGroupHeader,
    isTotalHeader,
    isMeasureHeaderItem,
    isResultAttributeHeaderItem,
    isResultMeasureHeaderItem,
    isResultTotalHeaderItem,
} from "./execution/results";

export {
    defForItems,
    defForBuckets,
    defForInsight,
    defWithDimensions,
    defWithSorting,
    defaultDimensionsGenerator,
} from "./execution/toolkit";

export { IFeatureFlagsQuery, IFeatureFlags } from "./featureFlags";

export { IWorkspaceMetadata } from "./metadata";

export { IElementQueryFactory, IElementQueryResult, IElementQuery, Element } from "./elements";

export { IExportConfig, IExportResult } from "./export";

export { IWorkspaceStyling } from "./styling";

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
