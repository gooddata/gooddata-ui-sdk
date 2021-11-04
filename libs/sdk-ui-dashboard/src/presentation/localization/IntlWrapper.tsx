// (C) 2007-2019 GoodData Corporation
import React, { useCallback } from "react";
import { IntlProvider } from "react-intl";
import {
    DefaultLocale,
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
} from "@gooddata/sdk-ui";

import { translations } from "./translations";

/**
 * @internal
 */
export interface IIntlWrapperProps {
    locale?: string;
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
    return <TranslationsCustomizationProvider translations={translations[locale]} render={render} />;
};
