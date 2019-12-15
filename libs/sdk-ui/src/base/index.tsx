// (C) 2019 GoodData Corporation

/*
 *
 */

export { DefaultColorPalette } from "./constants/colorPalette";
export { BucketNames } from "./constants/bucketNames";

/*
 * Error handling
 */
export { ErrorCodes, GoodDataSdkError, isGoodDataSdkError } from "./errors/GoodDataSdkError";
export { IErrorDescriptors, newErrorMapping, convertError } from "./errors/errorHandling";

/*
 * Base React stuff
 */
export { LoadingComponent, ILoadingProps } from "./react/LoadingComponent";
export { ErrorComponent, IErrorProps } from "./react/ErrorComponent";
export { BackendProvider, useBackend, withBackend } from "./react/BackendContext";
export { WorkspaceProvider, useWorkspace, withWorkspace } from "./react/WorkspaceContext";
export { withContexts } from "./react/withContexts";
export {
    withLoading,
    IWithLoading,
    IWithLoadingEvents,
    WithLoadingResult,
    WithLoadingState,
} from "./react/withLoading";
export { wrapDisplayName } from "./react/wrapDisplayName";

/*
 * Localization exports
 */

export { ILocale, DefaultLocale } from "./localization/Locale";
export { addLocaleDataToReactIntl, getIntl, getTranslation } from "./localization/IntlStore";
export { IntlWrapper, IIntlWrapperProps, messagesMap } from "./localization/IntlWrapper";
export {
    TranslationsProvider,
    IntlTranslationsProvider,
    ITranslationsComponentProps,
    ITranslationsProviderProps,
} from "./localization/TranslationsProvider";
export { createIntlMock, withIntl } from "./localization/intlUtils";

/*
 * Header matching & predicates
 */

export { IMappingHeader } from "./headerMatching/MappingHeader";
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
export { IArithmeticMeasureTitleProps, IMeasureTitleProps } from "./measureTitles/MeasureTitle";

/*
 *
 */

export { IVisualizationProps, IVisualizationCallbacks } from "./vis/VisualizationProps";
export {
    IPushData,
    OnError,
    OnExportReady,
    OnLoadingChanged,
    ILoadingState,
    IExportFunction,
    IExtendedExportConfig,
} from "./vis/Events";
export { VisualizationTypes, VisualizationEnvironment } from "./vis/visualizationTypes";
