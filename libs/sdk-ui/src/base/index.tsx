// (C) 2019-2025 GoodData Corporation

/*
 *
 */

export { DefaultColorPalette } from "./constants/colorPalette.js";
export type { BucketNameKeys, BucketNameValues } from "./constants/bucketNames.js";
export { BucketNames } from "./constants/bucketNames.js";
export { visualizationIsBetaWarning } from "./helpers/logging.js";

/*
 * Error handling
 */
export type { SdkErrorType } from "./errors/GoodDataSdkError.js";
export {
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
export type { IErrorDescriptors } from "./errors/errorHandling.js";
export {
    newErrorMapping,
    convertError,
    convertDataWindowError,
    defaultErrorHandler,
} from "./errors/errorHandling.js";

/*
 * Base React stuff
 */
export { forwardRefWithGenerics } from "./react/forwardRefWithGenerics.js";
export type { ILoadingProps } from "./react/LoadingComponent.js";
export { LoadingComponent } from "./react/LoadingComponent.js";
export type { IErrorProps } from "./react/ErrorComponent.js";
export { ErrorComponent } from "./react/ErrorComponent.js";
export type { IBackendProviderProps } from "./react/BackendContext.js";
export { BackendProvider, useBackend, useBackendStrict, withBackend } from "./react/BackendContext.js";
export type {
    ICorrelationProviderProps,
    IBackendProviderWithCorrelationProps,
} from "./react/CorrelationContext.js";
export {
    CorrelationProvider,
    useCorrelationData,
    useBackendWithCorrelation,
    BackendProviderWithCorrelation,
} from "./react/CorrelationContext.js";
export { useDebouncedState } from "./react/debounce.js";
export type { UseDebouncedStateOutput } from "./react/debounce.js";
export type { IWorkspaceProviderProps } from "./react/WorkspaceContext.js";
export {
    WorkspaceProvider,
    useWorkspace,
    useWorkspaceStrict,
    withWorkspace,
} from "./react/WorkspaceContext.js";
export type { IOrganizationProviderProps } from "./react/OrganizationContext.js";
export { OrganizationProvider, useOrganization } from "./react/OrganizationContext.js";
export type { IPlaceholdersProviderProps } from "./react/placeholders/context.js";
export { PlaceholdersProvider } from "./react/placeholders/context.js";
export type {
    AnyPlaceholder,
    IPlaceholder,
    IComposedPlaceholder,
    Flatten,
    IUsePlaceholderHook,
    PlaceholderValue,
    PlaceholdersValues,
    PlaceholderResolvedValue,
    PlaceholdersResolvedValues,
    AnyPlaceholderOf,
    AnyArrayOf,
    ValueOrPlaceholder,
    ValuesOrPlaceholders,
    ArrayOf,
    PlaceholderOf,
    MeasureOf,
    AnyMeasure,
    ComposedPlaceholderResolutionContext,
    IUseComposedPlaceholderHook,
    UnionToIntersection,
    ValueOrMultiValuePlaceholder,
} from "./react/placeholders/base.js";
export { getObjectDiff, useObjectDiff } from "./react/useObjectDiff.js";
export { isAnyPlaceholder, isPlaceholder, isComposedPlaceholder } from "./react/placeholders/base.js";
export type { IPlaceholderOptions } from "./react/placeholders/factory.js";
export { newComposedPlaceholder, newPlaceholder } from "./react/placeholders/factory.js";
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
export type { IUsePagedResourceResult, IUsePagedResourceState } from "./react/usePagedResource.js";
export { usePagedResource } from "./react/usePagedResource.js";
export type {
    UseCancelablePromiseStatus,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseOptions,
    UseCancelablePromiseState,
    UseCancelablePromiseErrorState,
    UseCancelablePromiseLoadingState,
    UseCancelablePromisePendingState,
    UseCancelablePromiseSuccessState,
} from "./react/useCancelablePromise.js";
export { useCancelablePromise } from "./react/useCancelablePromise.js";
export { withContexts } from "./react/withContexts.js";
export { wrapDisplayName } from "./react/wrapDisplayName.js";
export type { ICancelablePromise } from "./react/CancelablePromise.js";
export { CancelError, makeCancelable, isCancelError } from "./react/CancelablePromise.js";
export type { ILoadingInjectedProps } from "./react/legacy/withEntireDataView.js";
export { withEntireDataView } from "./react/legacy/withEntireDataView.js";
export { getIntersectionAttributes } from "./react/legacy/availableDrillTargets.js";
export { createContextStore } from "./react/contextStore.js";
export type {
    IContextStore,
    IContextStoreProvider,
    IUseContextStore,
    IContextStoreSelector,
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
export type {
    IClientWorkspaceProviderProps,
    IClientWorkspaceProviderCoreProps,
    IClientWorkspaceProviderWithClientAndDataProductProps,
    IClientWorkspaceProviderWithWorkspaceProps,
} from "./react/ClientWorkspaceContext/ClientWorkspaceContext.js";
export {
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

export type { ILocale } from "./localization/Locale.js";
export { DefaultLocale, isLocale, LOCALES } from "./localization/Locale.js";
export { getTranslation, getIntl } from "./localization/IntlStore.js";
export type { IIntlWrapperProps } from "./localization/IntlWrapper.js";
export { IntlWrapper } from "./localization/IntlWrapper.js";
export type { ITranslations } from "./localization/messagesMap.js";
export { resolveMessages, DEFAULT_MESSAGES, DEFAULT_LANGUAGE } from "./localization/messagesMap.js";
export type {
    ITranslationsComponentProps,
    ITranslationsProviderOwnProps,
    ITranslationsProviderProps,
} from "./localization/TranslationsProvider.js";
export { TranslationsProvider, IntlTranslationsProvider } from "./localization/TranslationsProvider.js";
export {
    createIntlMock,
    withIntl,
    withIntlForTest,
    Intl,
    resolveLocale,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
    clusterTitleFromIntl,
    resolveLocaleDefaultMessages,
    useResolveMessages,
} from "./localization/intlUtils.js";

/*
 * Header matching & predicates
 */

export type { IMappingHeader } from "./headerMatching/MappingHeader.js";
export {
    getMappingHeaderLocalIdentifier,
    hasMappingHeaderLocalIdentifier,
    getMappingHeaderUri,
    getMappingHeaderName,
    getMappingHeaderIdentifier,
    getAttributeHeaderItemName,
    getMappingHeaderFormattedName,
    hasMappingHeaderFormattedName,
} from "./headerMatching/MappingHeader.js";
export type { IHeaderPredicate, IHeaderPredicateContext } from "./headerMatching/HeaderPredicate.js";
export { isHeaderPredicate } from "./headerMatching/HeaderPredicate.js";

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
export type { IFocusHighchartsDatapointEventDetail } from "./vis/HighchartsEvents.js";
export {
    FOCUS_HIGHCHARTS_DATAPOINT_EVENT,
    createFocusHighchartsDatapointEvent,
} from "./vis/HighchartsEvents.js";
export type {
    OnFiredDrillEvent,
    IDrillableItem,
    DrillEventIntersectionElementHeader,
    IDrillableItemIdentifier,
    IDrillableItemUri,
    IDrillConfig,
    IDrillEvent,
    IDrillEventCallback,
    IDrillEventContext,
    IDrillEventContextGroup,
    IDrillEventContextHeadline,
    IDrillEventContextPoint,
    IDrillEventContextTable,
    IDrillEventContextXirr,
    IDrillEventIntersectionElement,
    IDrillIntersectionAttributeItem,
    IDrillPoint,
    ExplicitDrill,
    IHighchartsCategoriesTree,
    IHighchartsParentTick,
} from "./vis/DrillEvents.js";
export {
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
} from "./vis/drilling.js";
export { createExportFunction, createExportErrorFunction } from "./vis/export.js";
export type {
    VisualizationEnvironment,
    ChartType,
    VisType,
    HeadlineElementType,
    ChartElementType,
    HeadlineType,
    TableElementType,
    TableType,
    VisElementType,
    XirrType,
} from "./vis/visualizationTypes.js";
export { VisualizationTypes, getVisualizationType } from "./vis/visualizationTypes.js";
export type { Subtract } from "./typings/subtract.js";
export type { OverTimeComparisonType } from "./interfaces/OverTimeComparison.js";
export { OverTimeComparisonTypes } from "./interfaces/OverTimeComparison.js";
/*
 *
 */

export { DataViewFacade } from "./results/facade.js";
export type { CollectionItemsRequestOptions } from "./results/facade.js";
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
export type {
    ITableDataValue,
    ITableAttributeHeaderValue,
    ITableGrandTotalHeaderValue,
    ITableGrandTotalSubtotalMeasureValue,
    ITableGrandTotalMeasureValue,
    ITableSubtotalMeasureValue,
    ITableMeasureValue,
    ITableMeasureHeaderValue,
    ITableOverallTotalMeasureValue,
    ITableTotalHeaderValue,
} from "./results/tableData/interfaces/cells.js";
export {
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
export type {
    ITableAttributeColumnDefinition,
    ITableValueColumnDefinition,
    ITableSubtotalColumnDefinition,
    ITableGrandTotalColumnDefinition,
    ITableMeasureGroupValueColumnDefinition,
    ITableColumnDefinition,
    ITableMeasureGroupHeaderColumnDefinition,
} from "./results/tableData/interfaces/columns.js";
export {
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
export type {
    ITableRowDefinition,
    ITableSubtotalRowDefinition,
    ITableValueRowDefinition,
    ITableGrandTotalRowDefinition,
} from "./results/tableData/interfaces/rows.js";
export {
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
} from "./results/tableData/interfaces/scope.js";
export type {
    ITableDataMeasureGroupScope,
    ITableDataAttributeScope,
    ITableDataMeasureTotalScope,
    ITableDataAttributeTotalScope,
    ITableDataHeaderScope,
    ITableDataMeasureScope,
} from "./results/tableData/interfaces/scope.js";
export type { DataAccessConfig, ValueFormatter, HeaderTranslator } from "./results/dataAccessConfig.js";
export { createNumberJsFormatter, DefaultDataAccessConfig } from "./results/dataAccessConfig.js";

export type { IDashboardUrlBuilder, IWidgetUrlBuilder, IAutomationUrlBuilder } from "./url/dashboardUrl.js";
export { buildDashboardUrl, buildWidgetUrl, buildAutomationUrl } from "./url/dashboardUrl.js";
export { navigate } from "./url/navigate.js";

export { getTotalInfo } from "./results/internal/utils.js";

/*
 * URL utilities
 */
export { compressForUrl, decompressFromUrl } from "./url/compression.js";
