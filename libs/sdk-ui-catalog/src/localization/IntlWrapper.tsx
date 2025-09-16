// (C) 2024-2025 GoodData Corporation

import { type ReactNode, useCallback } from "react";

import { IntlProvider } from "react-intl";

import {
    DefaultLocale,
    type ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
    resolveLocaleDefaultMessages,
} from "@gooddata/sdk-ui";

import { translations } from "./translations.js";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
    children?: ReactNode;
}

/**
 * @internal
 */
export function IntlWrapper({ children, locale = DefaultLocale }: IIntlWrapperProps) {
    const render = useCallback<ITranslationsCustomizationProviderProps["render"]>(
        (modifiedTranslations) => (
            <IntlProvider locale={locale} messages={modifiedTranslations}>
                {children}
            </IntlProvider>
        ),
        [locale, children],
    );
    return (
        <TranslationsCustomizationProvider
            translations={resolveLocaleDefaultMessages(locale, translations)}
            render={render}
        />
    );
}
