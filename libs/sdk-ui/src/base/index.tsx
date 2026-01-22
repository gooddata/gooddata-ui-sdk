// (C) 2019-2026 GoodData Corporation

/*
 *
 */

export { DefaultColorPalette } from "./constants/colorPalette.js";
export { type BucketNameKeys, type BucketNameValues, BucketNames } from "./constants/bucketNames.js";
export { visualizationIsBetaWarning } from "./helpers/logging.js";

/*
 * Error handling
 */
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
} from "./errors/GoodDataSdkError.js";
export {
    type IErrorDescriptors,
    newErrorMapping,
    convertError,
    convertDataWindowError,
    defaultErrorHandler,
} from "./errors/errorHandling.js";

/*
 * Base React stuff
 */
export { forwardRefWithGenerics } from "./react/forwardRefWithGenerics.js";
export { type ILoadingProps, LoadingComponent } from "./react/LoadingComponent.js";
export { type IErrorProps, ErrorComponent } from "./react/ErrorComponent.js";
export {
    type IBackendProviderProps,
    BackendProvider,
    useBackend,
    useBackendStrict,
    withBackend,
} from "./react/BackendContext.js";
export {
    type ICorrelationProviderProps,
    type IBackendProviderWithCorrelationProps,
    CorrelationProvider,
    useCorrelationData,
    useBackendWithCorrelation,
    BackendProviderWithCorrelation,
} from "./react/CorrelationContext.js";
export { useDebouncedState, type UseDebouncedStateOutput } from "./react/debounce.js";
export {
    type IWorkspaceProviderProps,
    WorkspaceProvider,
    useWorkspace,
    useWorkspaceStrict,
    withWorkspace,
} from "./react/WorkspaceContext.js";
export {
    type IOrganizationProviderProps,
    OrganizationProvider,
    useOrganization,
} from "./react/OrganizationContext.js";
export { type IPlaceholdersProviderProps, PlaceholdersProvider } from "./react/placeholders/context.js";
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
} from "./react/placeholders/base.js";
export { getObjectDiff, useObjectDiff } from "./react/useObjectDiff.js";
export {
    type IPlaceholderOptions,
    newComposedPlaceholder,
    newPlaceholder,
} from "./react/placeholders/factory.js";
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
} from "./react/placeholders/aliases.js";
export {
    usePlaceholder,
    usePlaceholders,
    useComposedPlaceholder,
    useResolveValueWithPlaceholders,
    useResolveValuesWithPlaceholders,
} from "./react/placeholders/hooks.js";
export {
    type IUsePagedResourceResult,
    type IUsePagedResourceState,
    usePagedResource,
} from "./react/usePagedResource.js";
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
} from "./react/useCancelablePromise.js";
export { withContexts } from "./react/withContexts.js";
export { wrapDisplayName } from "./react/wrapDisplayName.js";
export {
    type ICancelablePromise,
    CancelError,
    makeCancelable,
    isCancelError,
} from "./react/CancelablePromise.js";
export { type ILoadingInjectedProps, withEntireDataView } from "./react/legacy/withEntireDataView.js";
export {
    getIntersectionAttributes,
    getMultiLayerDrillTargets,
} from "./react/legacy/availableDrillTargets.js";
export {
    createContextStore,
    type IContextStore,
    type IContextStoreProvider,
    type IUseContextStore,
    type IContextStoreSelector,
} from "./react/contextStore.js";

export {
    ValidationContextStore,
    useValidationContextValue,
} from "./react/validation/ValidationContextStore.js";
export {
    createInvalidDatapoint,
    createInvalidNode,
    getUpdatedInvalidTree,
    getInvalidNodeAtPath,
    getInvalidDatapointsInTree,
    validationSeverity,
} from "./react/validation/utils.js";
export type {
    IInvalidDatapoint,
    IValidationSeverity,
    IValidationContextValue,
    IInvalidNodePath,
    IInvalidNodeAtPath,
    IInvalidNode,
    IUnionPaths,
} from "./react/validation/types.js";

export {
    resolveUseCancelablePromisesError,
    resolveUseCancelablePromisesStatus,
} from "./react/useCancelablePromiseUtils.js";
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
} from "./react/ClientWorkspaceContext/ClientWorkspaceContext.js";
export type {
    IClientWorkspaceIdentifiers,
    IClientWorkspaceStatus,
} from "./react/ClientWorkspaceContext/interfaces.js";
export { resolveLCMWorkspaceIdentifiers } from "./react/ClientWorkspaceContext/resolveLCMWorkspaceIdentifiers.js";
export { usePrevious } from "./react/usePrevious.js";
export { usePropState } from "./react/usePropState.js";
export { useAutoupdateRef } from "./react/useAutoupdateRef.js";
export { useCombineRefs } from "./react/useCombineRefs.js";
export { useLocalStorage } from "./react/useLocalStorage.js";
/*
 * Localization exports
 */

export { type ILocale, DefaultLocale, isLocale, LOCALES } from "./localization/Locale.js";
export { getTranslation, getIntl } from "./localization/IntlStore.js";
export { type IIntlWrapperProps, IntlWrapper } from "./localization/IntlWrapper.js";
export {
    type ITranslations,
    resolveMessages,
    DEFAULT_MESSAGES,
    DEFAULT_LANGUAGE,
} from "./localization/messagesMap.js";
export {
    type ITranslationsComponentProps,
    type ITranslationsProviderOwnProps,
    type ITranslationsProviderProps,
    TranslationsProvider,
    IntlTranslationsProvider,
} from "./localization/TranslationsProvider.js";
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
} from "./localization/intlUtils.js";

/*
 * Header matching & predicates
 */

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
} from "./headerMatching/MappingHeader.js";
export {
    type IHeaderPredicate,
    type IHeaderPredicateContext,
    isHeaderPredicate,
} from "./headerMatching/HeaderPredicate.js";

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
} from "./headerMatching/HeaderPredicateFactory.js";

/*
 * Derived measure title generation
 */

export { ArithmeticMeasureTitleFactory } from "./measureTitles/ArithmeticMeasureTitleFactory.js";
export { DerivedMeasureTitleSuffixFactory } from "./measureTitles/DerivedMeasureTitleSuffixFactory.js";
export { fillMissingTitles, fillMissingTitlesWithMessages } from "./measureTitles/fillMissingTitles.js";
export { ignoreTitlesForSimpleMeasures } from "./measureTitles/ignoreTitlesForSimpleMeasures.js";
export type { IArithmeticMeasureTitleProps, IMeasureTitleProps } from "./measureTitles/MeasureTitle.js";

/*
 * Derived measure format generation
 */

export { fillMissingFormats } from "./measureFormats/fillMissingFormats.js";
export { fillMissingFormat } from "./measureFormats/fillMissingFormat.js";

/*
 *
 */

export type {
    IVisualizationProps,
    IVisualizationCallbacks,
    IDataVisualizationProps,
} from "./vis/VisualizationProps.js";
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
} from "./vis/Events.js";
export {
    type IFocusHighchartsDatapointEventDetail,
    FOCUS_HIGHCHARTS_DATAPOINT_EVENT,
    createFocusHighchartsDatapointEvent,
} from "./vis/HighchartsEvents.js";
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
} from "./vis/DrillEvents.js";
export {
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    getDrillIntersection,
    getIntersectionPartAfter,
    fireDrillEvent,
    getChartClickCoordinates,
    type IChartCoordinates,
} from "./vis/drilling.js";
export { createExportFunction, createExportErrorFunction } from "./vis/export.js";
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
} from "./vis/visualizationTypes.js";
export type { Subtract } from "./typings/subtract.js";
export { type OverTimeComparisonType, OverTimeComparisonTypes } from "./interfaces/OverTimeComparison.js";
/*
 *
 */

export { DataViewFacade, type CollectionItemsRequestOptions } from "./results/facade.js";
export type { IExecutionDefinitionMethods } from "./results/internal/definitionMethods.js";
export type { IResultDataMethods } from "./results/internal/resultDataMethods.js";
export type { IResultMetaMethods } from "./results/internal/resultMetaMethods.js";
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
} from "./results/dataAccess.js";
export type { ITableData } from "./results/tableData/interfaces/index.js";
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
} from "./results/tableData/interfaces/cells.js";
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
} from "./results/tableData/interfaces/columns.js";
export {
    type ITableRowDefinition,
    type ITableSubtotalRowDefinition,
    type ITableValueRowDefinition,
    type ITableGrandTotalRowDefinition,
    isValueRowDefinition,
    isSubtotalRowDefinition,
    isGrandTotalRowDefinition,
} from "./results/tableData/interfaces/rows.js";
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
} from "./results/tableData/interfaces/scope.js";
export {
    type DataAccessConfig,
    type ValueFormatter,
    type HeaderTranslator,
    createNumberJsFormatter,
    DefaultDataAccessConfig,
} from "./results/dataAccessConfig.js";

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
} from "./url/dashboardUrl.js";
export { navigate } from "./url/navigate.js";

export { getTotalInfo } from "./results/internal/utils.js";

/*
 * URL utilities
 */
export { compressForUrl, decompressFromUrl } from "./url/compression.js";
