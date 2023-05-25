// (C) 2021 GoodData Corporation
import React from "react";
import { wrapDisplayName } from "../../react/wrapDisplayName.js";
import compose from "lodash/flowRight.js";

const TranslationsCustomizationContext = React.createContext<Record<string, string> | undefined>(undefined);
TranslationsCustomizationContext.displayName = "TranslationsCustomizationContext";

const TranslationsCustomizationIsLoadingContext = React.createContext<boolean | undefined>(undefined);
TranslationsCustomizationIsLoadingContext.displayName = "TranslationsCustomizationIsLoadingContext";

/**
 * @beta
 */
export interface ITranslationsCustomizationContextProviderProps {
    /**
     * Flag telling whether settings is being loaded or not
     */
    translationsCustomizationIsLoading: boolean;

    /**
     * Customized translations.
     */
    translations: Record<string, string>;

    /**
     * React children
     */
    children?: React.ReactNode;
}

/**
 * @beta
 */
export const TranslationsCustomizationContextProvider: React.FC<
    ITranslationsCustomizationContextProviderProps
> = ({ children, translationsCustomizationIsLoading, translations }) => {
    return (
        <TranslationsCustomizationContext.Provider value={translations}>
            <TranslationsCustomizationIsLoadingContext.Provider value={translationsCustomizationIsLoading}>
                {children}
            </TranslationsCustomizationIsLoadingContext.Provider>
        </TranslationsCustomizationContext.Provider>
    );
};

function withTranslationsCustomizationValue<T extends { translations?: Record<string, string> }>(
    Component: React.ComponentType<T>,
): React.ComponentType<T> {
    const ComponentWithInjectedTranslationsCustomizationValue: React.FC<T> = (props) => {
        return (
            <TranslationsCustomizationContext.Consumer>
                {(translations) => <Component translations={translations} {...props} />}
            </TranslationsCustomizationContext.Consumer>
        );
    };

    return wrapDisplayName(
        "withTranslationsCustomizationValue",
        TranslationsCustomizationContextProvider,
    )(ComponentWithInjectedTranslationsCustomizationValue);
}

function withTranslationsCustomizationIsLoading<T extends { translationsCustomizationIsLoading?: boolean }>(
    Component: React.ComponentType<T>,
): React.ComponentType<T> {
    const ComponentWithInjectedTranslationsCustomizationIsLoading: React.FC<T> = (props) => {
        return (
            <TranslationsCustomizationIsLoadingContext.Consumer>
                {(translationsCustomizationIsLoading) => (
                    <Component
                        translationsCustomizationIsLoading={translationsCustomizationIsLoading}
                        {...props}
                    />
                )}
            </TranslationsCustomizationIsLoadingContext.Consumer>
        );
    };

    return wrapDisplayName(
        "withTranslationsCustomizationIsLoading",
        TranslationsCustomizationContextProvider,
    )(ComponentWithInjectedTranslationsCustomizationIsLoading);
}

/**
 * @beta
 */
export function withTranslationsCustomization<T>(
    Component: React.ComponentType<T>,
): React.ComponentType<Omit<T, "translationsCustomizationIsLoading" | "translations">> {
    return compose(
        wrapDisplayName("withTranslationsCustomization"),
        withTranslationsCustomizationValue,
        withTranslationsCustomizationIsLoading,
    )(Component);
}
