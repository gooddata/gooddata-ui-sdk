// (C) 2021-2025 GoodData Corporation

import { ComponentType, ReactNode, createContext } from "react";

import { wrapDisplayName } from "../../react/wrapDisplayName.js";

const TranslationsCustomizationContext = createContext<Record<string, string> | undefined>(undefined);
TranslationsCustomizationContext.displayName = "TranslationsCustomizationContext";

const TranslationsCustomizationIsLoadingContext = createContext<boolean | undefined>(undefined);
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
    children?: ReactNode;
}

/**
 * @beta
 */
export function TranslationsCustomizationContextProvider({
    children,
    translationsCustomizationIsLoading,
    translations,
}: ITranslationsCustomizationContextProviderProps) {
    return (
        <TranslationsCustomizationContext.Provider value={translations}>
            <TranslationsCustomizationIsLoadingContext.Provider value={translationsCustomizationIsLoading}>
                {children}
            </TranslationsCustomizationIsLoadingContext.Provider>
        </TranslationsCustomizationContext.Provider>
    );
}

function withTranslationsCustomizationValue<T extends { translations?: Record<string, string> }>(
    Component: ComponentType<T>,
): ComponentType<T> {
    function ComponentWithInjectedTranslationsCustomizationValue(props: T) {
        return (
            <TranslationsCustomizationContext.Consumer>
                {(translations) => <Component translations={translations} {...props} />}
            </TranslationsCustomizationContext.Consumer>
        );
    }

    return wrapDisplayName(
        "withTranslationsCustomizationValue",
        TranslationsCustomizationContextProvider,
    )(ComponentWithInjectedTranslationsCustomizationValue);
}

function withTranslationsCustomizationIsLoading<T extends { translationsCustomizationIsLoading?: boolean }>(
    Component: ComponentType<T>,
): ComponentType<T> {
    function ComponentWithInjectedTranslationsCustomizationIsLoading(props: T) {
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
    }

    return wrapDisplayName(
        "withTranslationsCustomizationIsLoading",
        TranslationsCustomizationContextProvider,
    )(ComponentWithInjectedTranslationsCustomizationIsLoading);
}

/**
 * @beta
 */
export function withTranslationsCustomization<T>(
    Component: ComponentType<T>,
): ComponentType<Omit<T, "translationsCustomizationIsLoading" | "translations">> {
    return wrapDisplayName("withTranslationsCustomization")(
        withTranslationsCustomizationValue(withTranslationsCustomizationIsLoading(Component as any) as any),
    );
}
