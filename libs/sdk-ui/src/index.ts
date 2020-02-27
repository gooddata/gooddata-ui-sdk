// (C) 2007-2020 GoodData Corporation
import "./polyfills";

//
// base exports
//

/*
 *
 */

export { DefaultColorPalette } from "./base/constants/colorPalette";
export { BucketNames } from "./base/constants/bucketNames";
export { visualizationIsBetaWarning } from "./base/helpers/logging";

/*
 * Error handling
 */
export { ErrorCodes, GoodDataSdkError, isGoodDataSdkError } from "./base/errors/GoodDataSdkError";
export {
    IErrorDescriptors,
    newErrorMapping,
    convertError,
    defaultErrorHandler,
} from "./base/errors/errorHandling";

/*
 * Base React stuff
 */
export { LoadingComponent, ILoadingProps } from "./base/react/LoadingComponent";
export { ErrorComponent, IErrorProps } from "./base/react/ErrorComponent";
export { BackendProvider, useBackend, withBackend } from "./base/react/BackendContext";
export { WorkspaceProvider, useWorkspace, withWorkspace } from "./base/react/WorkspaceContext";
export { usePagedResource } from "./base/react/usePagedResource";
export { withContexts } from "./base/react/withContexts";
export {
    withLoading,
    IWithLoading,
    IWithLoadingEvents,
    WithLoadingResult,
    WithLoadingState,
} from "./base/react/withLoading";
export { wrapDisplayName } from "./base/react/wrapDisplayName";

/*
 * Localization exports
 */

export { ILocale, DefaultLocale } from "./base/localization/Locale";
export { getTranslation, getIntl } from "./base/localization/IntlStore";
export { IntlWrapper, IIntlWrapperProps, messagesMap } from "./base/localization/IntlWrapper";
export {
    TranslationsProvider,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    ITranslationsProviderProps,
} from "./base/localization/TranslationsProvider";
export { createIntlMock, withIntl } from "./base/localization/intlUtils";

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
} from "./base/headerMatching/MappingHeader";
export {
    IHeaderPredicate,
    IHeaderPredicateContext,
    isHeaderPredicate,
} from "./base/headerMatching/HeaderPredicate";
export { HeaderPredicates } from "./base/headerMatching/HeaderPredicateFactory";

/*
 * Derived measure title generation
 */

export { ArithmeticMeasureTitleFactory } from "./base/measureTitles/ArithmeticMeasureTitleFactory";
export { DerivedMeasureTitleSuffixFactory } from "./base/measureTitles/DerivedMeasureTitleSuffixFactory";
export { fillMissingTitles } from "./base/measureTitles/fillMissingTitles";
export { IArithmeticMeasureTitleProps, IMeasureTitleProps } from "./base/measureTitles/MeasureTitle";

/*
 *
 */

export { IVisualizationProps, IVisualizationCallbacks } from "./base/vis/VisualizationProps";
export {
    IPushData,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    ILoadingState,
    IExportFunction,
    IExtendedExportConfig,
    IDrillableItemPushData,
    IColorAssignment,
    DrillableItemType,
    IColorsData,
} from "./base/vis/Events";
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
} from "./base/vis/DrillEvents";
export {
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    getDrillIntersection,
    fireDrillEvent,
} from "./base/vis/drilling";
export {
    VisualizationTypes,
    VisualizationEnvironment,
    ChartType,
    VisType,
    HeadlineElementType,
    getVisualizationType,
    ChartElementType,
} from "./base/vis/visualizationTypes";
export { Subtract } from "./base/typings/subtract";
export { OverTimeComparisonType, OverTimeComparisonTypes } from "./base/interfaces/OverTimeComparison";
export { CatalogHelper } from "./base/helpers/CatalogHelper";

//
// execution exports
//

export { withExecution, IWithExecution } from "./execution/withExecution";
export { Executor, IExecutorProps } from "./execution/Executor";

//
//
//

export { Kpi, IKpiProps } from "./kpi/Kpi";
export { KpiError } from "./kpi/KpiError";
