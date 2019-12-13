// (C) 2019 GoodData Corporation

/*
 * Error handling
 */
export { ErrorCodes, GoodDataSdkError, isGoodDataSdkError } from "./errors/GoodDataSdkError";
export { IErrorDescriptors, newErrorMapping, convertError } from "./errors/errorHandling";

/*
 * Base React stuff
 */
export { LoadingComponent, ILoadingProps } from "./simple/LoadingComponent";
export { ErrorComponent, IErrorProps } from "./simple/ErrorComponent";

export { BackendProvider, useBackend, withBackend } from "./context/BackendContext";
export { WorkspaceProvider, useWorkspace, withWorkspace } from "./context/WorkspaceContext";

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
