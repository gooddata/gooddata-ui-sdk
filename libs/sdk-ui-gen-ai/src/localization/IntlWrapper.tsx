// (C) 2024 GoodData Corporation
import React, { useCallback } from "react";
import { IntlProvider } from "react-intl";
import {
    DefaultLocale,
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
    resolveLocaleDefaultMessages,
} from "@gooddata/sdk-ui";

import { translations } from "./translations.js";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export const IntlWrapper: React.FC<IIntlWrapperProps> = ({ children, locale = DefaultLocale }) => {
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
};
