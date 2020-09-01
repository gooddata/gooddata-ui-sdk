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
export { ErrorCodes, GoodDataSdkError, isGoodDataSdkError } from "./errors/GoodDataSdkError";
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
export { BackendProvider, useBackend, withBackend } from "./react/BackendContext";
export { WorkspaceProvider, useWorkspace, withWorkspace } from "./react/WorkspaceContext";
export { usePagedResource } from "./react/usePagedResource";
export { withContexts } from "./react/withContexts";
export { wrapDisplayName } from "./react/wrapDisplayName";
export { CancelError, ICancelablePromise, makeCancelable, isCancelError } from "./react/CancelablePromise";
export { withEntireDataView, ILoadingInjectedProps } from "./react/legacy/withEntireDataView";

/*
 * Localization exports
 */

export { ILocale, DefaultLocale } from "./localization/Locale";
export { getTranslation, getIntl } from "./localization/IntlStore";
export { IntlWrapper, IIntlWrapperProps, messagesMap } from "./localization/IntlWrapper";
export {
    TranslationsProvider,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    ITranslationsProviderOwnProps,
    ITranslationsProviderProps,
} from "./localization/TranslationsProvider";
export { createIntlMock, withIntl } from "./localization/intlUtils";

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
import * as HeaderPredicates from "./headerMatching/HeaderPredicateFactory";
export { HeaderPredicates };

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
} from "./vis/visualizationTypes";
export { Subtract } from "./typings/subtract";
export { OverTimeComparisonType, OverTimeComparisonTypes } from "./interfaces/OverTimeComparison";
export { CatalogHelper } from "./helpers/CatalogHelper";

/*
 *
 */

export { DataViewFacade } from "./results/facade";
export {
    DataPoint,
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
