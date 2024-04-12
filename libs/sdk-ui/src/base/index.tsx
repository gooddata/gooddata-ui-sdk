// (C) 2019-2024 GoodData Corporation

/*
 *
 */

export { DefaultColorPalette } from "./constants/colorPalette.js";
export { BucketNames, BucketNameKeys, BucketNameValues } from "./constants/bucketNames.js";
export { visualizationIsBetaWarning } from "./helpers/logging.js";

/*
 * Error handling
 */
export {
    SdkErrorType,
    ErrorCodes,
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
    isDynamicScriptLoadSdkError,
} from "./errors/GoodDataSdkError.js";
export {
    IErrorDescriptors,
    newErrorMapping,
    convertError,
    defaultErrorHandler,
} from "./errors/errorHandling.js";

/*
 * Base React stuff
 */
export { LoadingComponent, ILoadingProps } from "./react/LoadingComponent.js";
export { ErrorComponent, IErrorProps } from "./react/ErrorComponent.js";
export {
    BackendProvider,
    useBackend,
    useBackendStrict,
    withBackend,
    IBackendProviderProps,
} from "./react/BackendContext.js";
export {
    WorkspaceProvider,
    useWorkspace,
    useWorkspaceStrict,
    withWorkspace,
    IWorkspaceProviderProps,
} from "./react/WorkspaceContext.js";
export { IPlaceholdersProviderProps, PlaceholdersProvider } from "./react/placeholders/context.js";
export {
    AnyPlaceholder,
    IPlaceholder,
    IComposedPlaceholder,
    isAnyPlaceholder,
    isPlaceholder,
    isComposedPlaceholder,
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
export { IPlaceholderOptions, newComposedPlaceholder, newPlaceholder } from "./react/placeholders/factory.js";
export {
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
    usePagedResource,
    IUsePagedResourceResult,
    IUsePagedResourceState,
} from "./react/usePagedResource.js";
export {
    UseCancelablePromiseStatus,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseOptions,
    UseCancelablePromiseState,
    UseCancelablePromiseErrorState,
    UseCancelablePromiseLoadingState,
    UseCancelablePromisePendingState,
    UseCancelablePromiseSuccessState,
} from "./react/useCancelablePromise.js";
export { withContexts } from "./react/withContexts.js";
export { wrapDisplayName } from "./react/wrapDisplayName.js";
export { CancelError, ICancelablePromise, makeCancelable, isCancelError } from "./react/CancelablePromise.js";
export { withEntireDataView, ILoadingInjectedProps } from "./react/legacy/withEntireDataView.js";
export { getIntersectionAttributes } from "./react/legacy/availableDrillTargets.js";

export {
    resolveUseCancelablePromisesError,
    resolveUseCancelablePromisesStatus,
} from "./react/useCancelablePromiseUtils.js";
export {
    IClientWorkspaceProviderProps,
    IClientWorkspaceProviderCoreProps,
    IClientWorkspaceProviderWithClientAndDataProductProps,
    IClientWorkspaceProviderWithWorkspaceProps,
    ClientWorkspaceProvider,
    ResolvedClientWorkspaceProvider,
    useClientWorkspaceIdentifiers,
    useClientWorkspaceStatus,
    useClientWorkspaceError,
    useClientWorkspaceInitialized,
} from "./react/ClientWorkspaceContext/ClientWorkspaceContext.js";
export {
    IClientWorkspaceIdentifiers,
    IClientWorkspaceStatus,
} from "./react/ClientWorkspaceContext/interfaces.js";
export { resolveLCMWorkspaceIdentifiers } from "./react/ClientWorkspaceContext/resolveLCMWorkspaceIdentifiers.js";
export { usePrevious } from "./react/usePrevious.js";
/*
 * Localization exports
 */

export { ILocale, DefaultLocale, isLocale, LOCALES } from "./localization/Locale.js";
export { getTranslation, getIntl } from "./localization/IntlStore.js";
export { IntlWrapper, IIntlWrapperProps } from "./localization/IntlWrapper.js";
export { messagesMap, ITranslations } from "./localization/messagesMap.js";
export {
    TranslationsProvider,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    ITranslationsProviderOwnProps,
    ITranslationsProviderProps,
} from "./localization/TranslationsProvider.js";
export {
    createIntlMock,
    withIntl,
    resolveLocale,
    emptyHeaderTitleFromIntl,
    totalColumnTitleFromIntl,
    resolveLocaleDefaultMessages,
} from "./localization/intlUtils.js";
export {
    ITranslationsCustomizationContextProviderProps,
    TranslationsCustomizationContextProvider,
    withTranslationsCustomization,
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
    pickCorrectInsightWording,
    pickCorrectMetricWording,
    pickCorrectWording,
    removeAllInsightToReportTranslations,
    removeAllWordingTranslationsWithSpecialSuffix,
} from "./localization/TranslationsCustomizationProvider/index.js";

/*
 * Header matching & predicates
 */

export {
    IMappingHeader,
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
    IHeaderPredicate,
    IHeaderPredicateContext,
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
export { fillMissingTitles } from "./measureTitles/fillMissingTitles.js";
export { ignoreTitlesForSimpleMeasures } from "./measureTitles/ignoreTitlesForSimpleMeasures.js";
export { IArithmeticMeasureTitleProps, IMeasureTitleProps } from "./measureTitles/MeasureTitle.js";

/*
 * Derived measure format generation
 */

export { fillMissingFormats } from "./measureFormats/fillMissingFormats.js";
export { fillMissingFormat } from "./measureFormats/fillMissingFormat.js";

/*
 *
 */

export {
    IVisualizationProps,
    IVisualizationCallbacks,
    IDataVisualizationProps,
} from "./vis/VisualizationProps.js";
export {
    IPushData,
    PushDataCallback,
    IOpenAsReportUiConfig,
    OnError,
    OnExportReady,
    OnLoadingChanged,
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
    isDrillableItemIdentifier,
    isDrillableItemUri,
    isDrillableItem,
    isExplicitDrill,
    ExplicitDrill,
    isDrillIntersectionAttributeItem,
    IHighchartsCategoriesTree,
    IHighchartsParentTick,
} from "./vis/DrillEvents.js";
export {
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    getDrillIntersection,
    getIntersectionPartAfter,
    fireDrillEvent,
} from "./vis/drilling.js";
export { createExportFunction, createExportErrorFunction } from "./vis/export.js";
export {
    VisualizationTypes,
    VisualizationEnvironment,
    ChartType,
    VisType,
    HeadlineElementType,
    getVisualizationType,
    ChartElementType,
    HeadlineType,
    TableElementType,
    TableType,
    VisElementType,
    XirrType,
} from "./vis/visualizationTypes.js";
export { Subtract } from "./typings/subtract.js";
export { OverTimeComparisonType, OverTimeComparisonTypes } from "./interfaces/OverTimeComparison.js";
/*
 *
 */

export { DataViewFacade } from "./results/facade.js";
export { IExecutionDefinitionMethods } from "./results/internal/definitionMethods.js";
export { IResultDataMethods } from "./results/internal/resultDataMethods.js";
export { IResultMetaMethods } from "./results/internal/resultMetaMethods.js";
export {
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
export {
    DataAccessConfig,
    ValueFormatter,
    HeaderTranslator,
    createNumberJsFormatter,
    DefaultDataAccessConfig,
} from "./results/dataAccessConfig.js";

export { getTotalInfo } from "./results/internal/utils.js";
