// (C) 2007-2026 GoodData Corporation

/**
 * This package provides base functionality useful for building React visualizations on top of GoodData.
 *
 * @remarks
 * The functionality includes functions for getting data from the Analytical Backend,
 * components and React hooks that serve as building blocks for custom visualizations,
 * visualization definition placeholders, support for drilling, and so on.
 *
 * See the other `@gooddata/sdk-ui-*` packages (for example, `@gooddata/sdk-ui-charts`) for pre-built visualizations
 * that you can use instead of building your own.
 *
 * @packageDocumentation
 */

// Constants
export { DefaultColorPalette } from "./base/constants/colorPalette.js";
export { type BucketNameKeys, type BucketNameValues, BucketNames } from "./base/constants/bucketNames.js";

// Helpers
export { visualizationIsBetaWarning } from "./base/helpers/logging.js";

// Errors
export {
    type SdkErrorType,
    ErrorCodes,
    ForecastNotReceivedSdkError,
    ClusteringNotReceivedSdkError,
    GoodDataSdkError,
    UnauthorizedSdkError,
    NotFoundSdkError,
    CancelledSdkError,
    UnexpectedSdkError,
    ProtectedReportSdkError,
    NoDataSdkError,
    NegativeValuesSdkError,
    DataTooLargeToComputeSdkError,
    DataTooLargeToDisplaySdkError,
    GeoLocationMissingSdkError,
    GeoAreaMissingSdkError,
    BadRequestSdkError,
    GeoTokenMissingSdkError,
    DynamicScriptLoadSdkError,
    ResultCacheMissingSdkError,
    isGoodDataSdkError,
    isBadRequest,
    isCancelledSdkError,
    isDataTooLargeToCompute,
    isDataTooLargeToDisplay,
    isGeoLocationMissing,
    isGeoAreaMissing,
    isGeoTokenMissing,
    isNegativeValues,
    isNoDataSdkError,
    isNotFound,
    isProtectedReport,
    isUnauthorized,
    isUnknownSdkError,
    isForecastNotReceived,
    isClusteringNotReceived,
    isDynamicScriptLoadSdkError,
    isResultCacheMissingSdkError,
} from "./base/errors/GoodDataSdkError.js";
export {
    type IErrorDescriptors,
    newErrorMapping,
    convertError,
    convertDataWindowError,
    defaultErrorHandler,
} from "./base/errors/errorHandling.js";

// React base
export { forwardRefWithGenerics } from "./base/react/forwardRefWithGenerics.js";
export { type ILoadingProps, LoadingComponent } from "./base/react/LoadingComponent.js";
export { type IErrorProps, ErrorComponent } from "./base/react/ErrorComponent.js";
export {
    type IBackendProviderProps,
    BackendProvider,
    useBackend,
    useBackendStrict,
    withBackend,
} from "./base/react/BackendContext.js";
export {
    type ICorrelationProviderProps,
    type IBackendProviderWithCorrelationProps,
    CorrelationProvider,
    useCorrelationData,
    useBackendWithCorrelation,
    BackendProviderWithCorrelation,
} from "./base/react/CorrelationContext.js";
export { useDebouncedState, type UseDebouncedStateOutput } from "./base/react/debounce.js";
export {
    type IWorkspaceProviderProps,
    WorkspaceProvider,
    useWorkspace,
    useWorkspaceStrict,
    withWorkspace,
} from "./base/react/WorkspaceContext.js";
export {
    type IOrganizationProviderProps,
    OrganizationProvider,
    useOrganization,
} from "./base/react/OrganizationContext.js";
export { type IPlaceholdersProviderProps, PlaceholdersProvider } from "./base/react/placeholders/context.js";
export {
    type AnyPlaceholder,
    type IPlaceholder,
    type IComposedPlaceholder,
    type Flatten,
    type IUsePlaceholderHook,
    type PlaceholderValue,
    type PlaceholdersValues,
    type PlaceholderResolvedValue,
    type PlaceholdersResolvedValues,
    type AnyPlaceholderOf,
    type AnyArrayOf,
    type ValueOrPlaceholder,
    type ValuesOrPlaceholders,
    type ArrayOf,
    type PlaceholderOf,
    type MeasureOf,
    type AnyMeasure,
    type ComposedPlaceholderResolutionContext,
    type IUseComposedPlaceholderHook,
    type UnionToIntersection,
    type ValueOrMultiValuePlaceholder,
    isAnyPlaceholder,
    isPlaceholder,
    isComposedPlaceholder,
} from "./base/react/placeholders/base.js";
export { getObjectDiff, useObjectDiff } from "./base/react/useObjectDiff.js";
export {
    type IPlaceholderOptions,
    newComposedPlaceholder,
    newPlaceholder,
} from "./base/react/placeholders/factory.js";
export type {
    AttributeFilterOrPlaceholder,
    AttributeFiltersOrPlaceholders,
    AttributeMeasureOrPlaceholder,
    AttributeOrPlaceholder,
    AttributesMeasuresOrPlaceholders,
    AttributesOrPlaceholders,
    FilterOrMultiValuePlaceholder,
    FilterOrPlaceholder,
    FiltersOrPlaceholders,
    MeasureOrPlaceholder,
    MeasuresOrPlaceholders,
    NullableFilterOrPlaceholder,
    NullableFiltersOrPlaceholders,
    SortsOrPlaceholders,
    TotalsOrPlaceholders,
} from "./base/react/placeholders/aliases.js";
export {
    usePlaceholder,
    usePlaceholders,
    useComposedPlaceholder,
    useResolveValueWithPlaceholders,
    useResolveValuesWithPlaceholders,
} from "./base/react/placeholders/hooks.js";
export {
    type IUsePagedResourceResult,
    type IUsePagedResourceState,
    usePagedResource,
} from "./base/react/usePagedResource.js";
export {
    type UseCancelablePromiseStatus,
    type UseCancelablePromiseCallbacks,
    type UseCancelablePromiseOptions,
    type UseCancelablePromiseState,
    type UseCancelablePromiseErrorState,
    type UseCancelablePromiseLoadingState,
    type UseCancelablePromisePendingState,
    type UseCancelablePromiseSuccessState,
    useCancelablePromise,
} from "./base/react/useCancelablePromise.js";
export { withContexts } from "./base/react/withContexts.js";
export { wrapDisplayName } from "./base/react/wrapDisplayName.js";
export {
    type ICancelablePromise,
    CancelError,
    makeCancelable,
    isCancelError,
} from "./base/react/CancelablePromise.js";
export { type ILoadingInjectedProps, withEntireDataView } from "./base/react/legacy/withEntireDataView.js";
export {
    getIntersectionAttributes,
    getMultiLayerDrillTargets,
} from "./base/react/legacy/availableDrillTargets.js";
export {
    createContextStore,
    type IContextStore,
    type IContextStoreProvider,
    type IUseContextStore,
    type IContextStoreSelector,
} from "./base/react/contextStore.js";
export {
    ValidationContextStore,
    useValidationContextValue,
} from "./base/react/validation/ValidationContextStore.js";
export {
    createInvalidDatapoint,
    createInvalidNode,
    getUpdatedInvalidTree,
    getInvalidNodeAtPath,
    getInvalidDatapointsInTree,
    validationSeverity,
} from "./base/react/validation/utils.js";
export type {
    IInvalidDatapoint,
    IValidationSeverity,
    IValidationContextValue,
    IInvalidNodePath,
    IInvalidNodeAtPath,
    IInvalidNode,
    IUnionPaths,
} from "./base/react/validation/types.js";
export {
    resolveUseCancelablePromisesError,
    resolveUseCancelablePromisesStatus,
} from "./base/react/useCancelablePromiseUtils.js";
export {
    type IClientWorkspaceProviderProps,
    type IClientWorkspaceProviderCoreProps,
    type IClientWorkspaceProviderWithClientAndDataProductProps,
    type IClientWorkspaceProviderWithWorkspaceProps,
    ClientWorkspaceProvider,
    ResolvedClientWorkspaceProvider,
    useClientWorkspaceIdentifiers,
    useClientWorkspaceStatus,
    useClientWorkspaceError,
    useClientWorkspaceInitialized,
} from "./base/react/ClientWorkspaceContext/ClientWorkspaceContext.js";
export type {
    IClientWorkspaceIdentifiers,
    IClientWorkspaceStatus,
} from "./base/react/ClientWorkspaceContext/interfaces.js";
export { resolveLCMWorkspaceIdentifiers } from "./base/react/ClientWorkspaceContext/resolveLCMWorkspaceIdentifiers.js";
export { usePrevious } from "./base/react/usePrevious.js";
export { usePropState } from "./base/react/usePropState.js";
export { useAutoupdateRef } from "./base/react/useAutoupdateRef.js";
export { useCombineRefs } from "./base/react/useCombineRefs.js";
export { useLocalStorage } from "./base/react/useLocalStorage.js";

// Localization
export { type ILocale, DefaultLocale, isLocale, LOCALES } from "./base/localization/Locale.js";
export { getTranslation, getIntl } from "./base/localization/IntlStore.js";
export { type IIntlWrapperProps, IntlWrapper } from "./base/localization/IntlWrapper.js";
export {
    type ITranslations,
    resolveMessages,
    DEFAULT_MESSAGES,
    DEFAULT_LANGUAGE,
} from "./base/localization/messagesMap.js";
export {
    type ITranslationsComponentProps,
    type ITranslationsProviderOwnProps,
    type ITranslationsProviderProps,
    TranslationsProvider,
    IntlTranslationsProvider,
} from "./base/localization/TranslationsProvider.js";
export {
    createIntlMock,
    withIntl,
    withIntlForTest,
    Intl,
    resolveLocale,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
    clusterTitleFromIntl,
    anomaliesTitleFromIntl,
    resolveLocaleDefaultMessages,
    useResolveMessages,
} from "./base/localization/intlUtils.js";

// Header matching
export {
    type IMappingHeader,
    getMappingHeaderLocalIdentifier,
    hasMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    getMappingHeaderName,
    getMappingHeaderIdentifier,
    getAttributeHeaderItemName,
    getMappingHeaderFormattedName,
    hasMappingHeaderFormattedName,
} from "./base/headerMatching/MappingHeader.js";
export {
    type IHeaderPredicate,
    type IHeaderPredicateContext,
    isHeaderPredicate,
} from "./base/headerMatching/HeaderPredicate.js";
export {
    HeaderPredicates,
    attributeItemNameMatch,
    composedFromIdentifier,
    composedFromUri,
    identifierMatch,
    localIdentifierMatch,
    uriMatch,
    objRefMatch,
    objMatch,
} from "./base/headerMatching/HeaderPredicateFactory.js";

// Measure titles
export { ArithmeticMeasureTitleFactory } from "./base/measureTitles/ArithmeticMeasureTitleFactory.js";
export { DerivedMeasureTitleSuffixFactory } from "./base/measureTitles/DerivedMeasureTitleSuffixFactory.js";
export { fillMissingTitles, fillMissingTitlesWithMessages } from "./base/measureTitles/fillMissingTitles.js";
export { ignoreTitlesForSimpleMeasures } from "./base/measureTitles/ignoreTitlesForSimpleMeasures.js";
export type { IArithmeticMeasureTitleProps, IMeasureTitleProps } from "./base/measureTitles/MeasureTitle.js";

// Measure formats
export { fillMissingFormats } from "./base/measureFormats/fillMissingFormats.js";
export { fillMissingFormat } from "./base/measureFormats/fillMissingFormat.js";

// Visualization props
export type {
    IVisualizationProps,
    IVisualizationCallbacks,
    IDataVisualizationProps,
} from "./base/vis/VisualizationProps.js";
export type {
    IPushData,
    PushDataCallback,
    IOpenAsReportUiConfig,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    OnDataView,
    ILoadingState,
    IExportFunction,
    IExtendedExportConfig,
    IAvailableDrillTargets,
    IAvailableDrillTargetMeasure,
    IAvailableDrillTargetAttribute,
    IColorAssignment,
    IColorsData,
} from "./base/vis/Events.js";
export {
    type IFocusHighchartsDatapointEventDetail,
    FOCUS_HIGHCHARTS_DATAPOINT_EVENT,
    createFocusHighchartsDatapointEvent,
} from "./base/vis/HighchartsEvents.js";
export {
    type OnFiredDrillEvent,
    type IDrillableItem,
    type DrillEventIntersectionElementHeader,
    type IDrillableItemIdentifier,
    type IDrillableItemUri,
    type IDrillConfig,
    type IDrillEvent,
    type IDrillEventCallback,
    type IDrillEventContext,
    type IDrillEventContextGroup,
    type IDrillEventContextHeadline,
    type IDrillEventContextPoint,
    type IDrillEventContextTable,
    type IDrillEventContextXirr,
    type IDrillEventIntersectionElement,
    type IDrillIntersectionAttributeItem,
    type IDrillPoint,
    type ExplicitDrill,
    type IHighchartsCategoriesTree,
    type IHighchartsParentTick,
    isDrillableItemIdentifier,
    isDrillableItemUri,
    isDrillableItem,
    isExplicitDrill,
    isDrillIntersectionAttributeItem,
    isDrillIntersectionDateAttributeItem,
} from "./base/vis/DrillEvents.js";
export {
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    getDrillIntersection,
    getIntersectionPartAfter,
    fireDrillEvent,
    getChartClickCoordinates,
    type IChartCoordinates,
} from "./base/vis/drilling.js";
export { createExportFunction, createExportErrorFunction } from "./base/vis/export.js";
export {
    type VisualizationEnvironment,
    type ChartType,
    type VisType,
    type HeadlineElementType,
    type ChartElementType,
    type HeadlineType,
    type TableElementType,
    type TableType,
    type VisElementType,
    type XirrType,
    VisualizationTypes,
    getVisualizationType,
} from "./base/vis/visualizationTypes.js";
export type { Subtract } from "./base/typings/subtract.js";
export {
    type OverTimeComparisonType,
    OverTimeComparisonTypes,
} from "./base/interfaces/OverTimeComparison.js";

// Results
export { DataViewFacade } from "./base/results/facade.js";
export { type CollectionItemsRequestOptions } from "./base/results/internal/collectionItemsHelpers.js";
export type { IExecutionDefinitionMethods } from "./base/results/internal/definitionMethods.js";
export type { IResultDataMethods } from "./base/results/internal/resultDataMethods.js";
export type { IResultMetaMethods } from "./base/results/internal/resultMetaMethods.js";
export type {
    DataSeriesId,
    DataPoint,
    DataSeriesDescriptorMethods,
    DataSliceDescriptorMethods,
    DataSliceId,
    DataSliceDescriptor,
    IDataSlice,
    DataSeriesDescriptor,
    IDataSeries,
    IDataSliceCollection,
    IDataSeriesCollection,
    IDataAccessMethods,
    DataSeriesHeaders,
    DataSliceHeaders,
    DataPointCoordinates,
} from "./base/results/dataAccess.js";
export type { ITableData } from "./base/results/tableData/interfaces/index.js";
export {
    type ITableDataValue,
    type ITableAttributeHeaderValue,
    type ITableGrandTotalHeaderValue,
    type ITableGrandTotalSubtotalMeasureValue,
    type ITableGrandTotalMeasureValue,
    type ITableSubtotalMeasureValue,
    type ITableMeasureValue,
    type ITableMeasureHeaderValue,
    type ITableOverallTotalMeasureValue,
    type ITableTotalHeaderValue,
    isTableAttributeHeaderValue,
    isTableGrandTotalHeaderValue,
    isTableGrandTotalSubtotalMeasureValue,
    isTableGrandTotalMeasureValue,
    isTableSubtotalMeasureValue,
    isTableMeasureValue,
    isTableMeasureHeaderValue,
    isTableOverallTotalMeasureValue,
    isTableTotalHeaderValue,
} from "./base/results/tableData/interfaces/cells.js";
export {
    type ITableAttributeColumnDefinition,
    type ITableValueColumnDefinition,
    type ITableSubtotalColumnDefinition,
    type ITableGrandTotalColumnDefinition,
    type ITableMeasureGroupValueColumnDefinition,
    type ITableColumnDefinition,
    type ITableMeasureGroupHeaderColumnDefinition,
    isAttributeColumnDefinition,
    isValueColumnDefinition,
    isMeasureGroupHeaderColumnDefinition,
    isMeasureGroupValueColumnDefinition,
    isSubtotalColumnDefinition,
    isGrandTotalColumnDefinition,
    isTransposedValueColumnDefinition,
    isStandardValueColumnDefinition,
    isEmptyValueColumnDefinition,
    isStandardSubtotalColumnDefinition,
    isStandardGrandTotalColumnDefinition,
} from "./base/results/tableData/interfaces/columns.js";
export {
    type ITableRowDefinition,
    type ITableSubtotalRowDefinition,
    type ITableValueRowDefinition,
    type ITableGrandTotalRowDefinition,
    isValueRowDefinition,
    isSubtotalRowDefinition,
    isGrandTotalRowDefinition,
} from "./base/results/tableData/interfaces/rows.js";
export {
    isAttributeScope,
    isAttributeTotalScope,
    isMeasureScope,
    isMeasureTotalScope,
    isMeasureGroupScope,
    type ITableDataMeasureGroupScope,
    type ITableDataAttributeScope,
    type ITableDataMeasureTotalScope,
    type ITableDataAttributeTotalScope,
    type ITableDataHeaderScope,
    type ITableDataMeasureScope,
} from "./base/results/tableData/interfaces/scope.js";
export {
    type DataAccessConfig,
    type ValueFormatter,
    type HeaderTranslator,
    createNumberJsFormatter,
    DefaultDataAccessConfig,
} from "./base/results/dataAccessConfig.js";
export { getTotalInfo } from "./base/results/internal/utils.js";

// URL utilities
export {
    type IDashboardUrlBuilder,
    type IDashboardUrlQueryParams,
    type IWidgetUrlQueryParams,
    type IWidgetUrlBuilder,
    type IAutomationUrlQueryParams,
    type IAutomationUrlBuilder,
    buildDashboardUrl,
    buildWidgetUrl,
    buildAutomationUrl,
} from "./base/url/dashboardUrl.js";
export { navigate } from "./base/url/navigate.js";
export { compressForUrl, decompressFromUrl } from "./base/url/compression.js";

// Execution
export { type IWithExecution, withExecution } from "./execution/withExecution.js";
export {
    type IWithExecutionLoading,
    type IWithLoadingEvents,
    type WithLoadingResult,
    type DataViewWindow,
    withExecutionLoading,
} from "./execution/withExecutionLoading.js";
export { type IRawExecuteProps, RawExecute } from "./execution/RawExecute.js";
export { type IExecuteProps, Execute } from "./execution/Execute.js";
export {
    type UseDataExportCallbacks,
    type UseDataExportState,
    useDataExport,
} from "./execution/useDataExport.js";
export {
    type IExecutionConfiguration,
    type IUseExecutionDataViewConfig,
    type UseExecutionDataViewCallbacks,
    useExecutionDataView,
} from "./execution/useExecutionDataView.js";
export {
    type IUseInsightDataViewConfig,
    type UseInsightDataViewCallbacks,
    useInsightDataView,
} from "./execution/useInsightDataView.js";
export { type IExecuteInsightProps, ExecuteInsight } from "./execution/ExecuteInsight.js";
export type {
    IExecuteErrorComponent,
    IExecuteErrorComponentProps,
    IExecuteLoadingComponent,
} from "./execution/interfaces.js";
export { DataViewLoader } from "./execution/DataViewLoader.js";

// KPI
export { type IKpiProps, Kpi } from "./kpi/Kpi.js";

// Locales
export { messages } from "./locales.js";

/**
 * Common interface uses to specify number separators for the different SDK components.
 * @public
 */
export type { ISeparators } from "@gooddata/sdk-model";
