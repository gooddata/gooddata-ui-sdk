// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import { CustomFormats, IntlProvider } from "react-intl";
import {
    DefaultLocale,
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
} from "@gooddata/sdk-ui";

import { translations } from "./translations.js";

const formats: CustomFormats = {
    time: {
        hhmm: {
            hour: "numeric",
            minute: "2-digit",
        },
    },
    date: {
        shortWithoutYear: {
            day: "numeric",
            month: "short",
        },
        shortWithYear: {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    },
};

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
            <IntlProvider locale={locale} messages={modifiedTranslations} formats={formats}>
                {children}
            </IntlProvider>
        ),
        [locale, children],
    );
    return <TranslationsCustomizationProvider translations={translations[locale]} render={render} />;
};
