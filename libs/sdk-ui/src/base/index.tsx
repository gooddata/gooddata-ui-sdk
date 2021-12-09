// (C) 2019 GoodData Corporation

/*
 *
 */

export { DefaultColorPalette } from "./constants/colorPalette";
export { BucketNames } from "./constants/bucketNames";
export { visualizationIsBetaWarning } from "./helpers/logging";

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
} from "./errors/GoodDataSdkError";
export {
    IErrorDescriptors,
    newErrorMapping,
    convertError,
    defaultErrorHandler,
} from "./errors/errorHandling";

/*
 * Base React stuff
 */
export { LoadingComponent, ILoadingProps } from "./react/LoadingComponent";
export { ErrorComponent, IErrorProps } from "./react/ErrorComponent";
export {
    BackendProvider,
    useBackend,
    useBackendStrict,
    withBackend,
    IBackendProviderProps,
} from "./react/BackendContext";
export {
    WorkspaceProvider,
    useWorkspace,
    useWorkspaceStrict,
    withWorkspace,
    IWorkspaceProviderProps,
} from "./react/WorkspaceContext";
export { IPlaceholdersProviderProps, PlaceholdersProvider } from "./react/placeholders/context";
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
} from "./react/placeholders/base";
export { IPlaceholderOptions, newComposedPlaceholder, newPlaceholder } from "./react/placeholders/factory";
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
} from "./react/placeholders/aliases";
export {
    usePlaceholder,
    usePlaceholders,
    useComposedPlaceholder,
    useResolveValueWithPlaceholders,
    useResolveValuesWithPlaceholders,
} from "./react/placeholders/hooks";
export { usePagedResource, IUsePagedResourceResult, IUsePagedResourceState } from "./react/usePagedResource";
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
} from "./react/useCancelablePromise";
export { withContexts } from "./react/withContexts";
export { wrapDisplayName } from "./react/wrapDisplayName";
export { CancelError, ICancelablePromise, makeCancelable, isCancelError } from "./react/CancelablePromise";
export { withEntireDataView, ILoadingInjectedProps } from "./react/legacy/withEntireDataView";
export { getIntersectionAttributes } from "./react/legacy/availableDrillTargets";

export {
    resolveUseCancelablePromisesError,
    resolveUseCancelablePromisesStatus,
} from "./react/useCancelablePromiseUtils";
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
} from "./react/ClientWorkspaceContext/ClientWorkspaceContext";
export { IClientWorkspaceIdentifiers } from "./react/ClientWorkspaceContext/interfaces";
export { resolveLCMWorkspaceIdentifiers } from "./react/ClientWorkspaceContext/resolveLCMWorkspaceIdentifiers";
export { usePrevious } from "./react/usePrevious";
/*
 * Localization exports
 */

export { ILocale, DefaultLocale } from "./localization/Locale";
export { getTranslation, getIntl } from "./localization/IntlStore";
export { IntlWrapper, IIntlWrapperProps, messagesMap, ITranslations } from "./localization/IntlWrapper";
export {
    TranslationsProvider,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    ITranslationsProviderOwnProps,
    ITranslationsProviderProps,
} from "./localization/TranslationsProvider";
// FIXME: temp build fix
export { createIntlMock, withIntl } from "./localization/intlUtils";
export {
    ITranslationsCustomizationContextProviderProps,
    TranslationsCustomizationContextProvider,
    withTranslationsCustomization,
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
    pickCorrectInsightWording,
    removeAllInsightToReportTranslations,
} from "./localization/TranslationsCustomizationProvider";

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
} from "./headerMatching/MappingHeader";
export {
    IHeaderPredicate,
    IHeaderPredicateContext,
    isHeaderPredicate,
} from "./headerMatching/HeaderPredicate";

export {
    HeaderPredicates,
    attributeItemNameMatch,
    composedFromIdentifier,
    composedFromUri,
    identifierMatch,
    localIdentifierMatch,
    uriMatch,
    objRefMatch,
} from "./headerMatching/HeaderPredicateFactory";

/*
 * Derived measure title generation
 */

export { ArithmeticMeasureTitleFactory } from "./measureTitles/ArithmeticMeasureTitleFactory";
export { DerivedMeasureTitleSuffixFactory } from "./measureTitles/DerivedMeasureTitleSuffixFactory";
export { fillMissingTitles } from "./measureTitles/fillMissingTitles";
export { ignoreTitlesForSimpleMeasures } from "./measureTitles/ignoreTitlesForSimpleMeasures";
export { IArithmeticMeasureTitleProps, IMeasureTitleProps } from "./measureTitles/MeasureTitle";

/*
 *
 */

export {
    IVisualizationProps,
    IVisualizationCallbacks,
    IDataVisualizationProps,
} from "./vis/VisualizationProps";
export {
    IPushData,
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
} from "./vis/Events";
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
} from "./vis/DrillEvents";
export {
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    getDrillIntersection,
    getIntersectionPartAfter,
    fireDrillEvent,
} from "./vis/drilling";
export { createExportFunction, createExportErrorFunction } from "./vis/export";
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
} from "./vis/visualizationTypes";
export { Subtract } from "./typings/subtract";
export { OverTimeComparisonType, OverTimeComparisonTypes } from "./interfaces/OverTimeComparison";
export {
    CatalogHelper,
    IAttrItem,
    IAttrs,
    ICatalog,
    IDataSet,
    IDisplayForms,
    IIdentifierWithTags,
} from "./helpers/CatalogHelper";

/*
 *
 */

export { DataViewFacade } from "./results/facade";
export { IExecutionDefinitionMethods } from "./results/internal/definitionMethods";
export { IResultDataMethods } from "./results/internal/resultDataMethods";
export { IResultMetaMethods } from "./results/internal/resultMetaMethods";
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
} from "./results/dataAccess";
export {
    DataAccessConfig,
    ValueFormatter,
    HeaderTranslator,
    createNumberJsFormatter,
    DefaultDataAccessConfig,
} from "./results/dataAccessConfig";
