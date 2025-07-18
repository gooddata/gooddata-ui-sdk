// (C) 2007-2025 GoodData Corporation
import { ReactNode, useCallback } from "react";
import { CustomFormats, IntlProvider } from "react-intl";
import {
    DefaultLocale,
    ITranslationsCustomizationProviderProps,
    TranslationsCustomizationProvider,
    resolveLocaleDefaultMessages,
} from "@gooddata/sdk-ui";

import { translations } from "../../internal/utils/translations.js";

const formats: CustomFormats = {
    time: {
        hhmm: {
            hour: "numeric",
            minute: "numeric",
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
    children?: ReactNode;
}

/**
 * @internal
 */
export function IntlWrapper({ children, locale = DefaultLocale }: IIntlWrapperProps) {
    const render = useCallback<ITranslationsCustomizationProviderProps["render"]>(
        (modifiedTranslations) => (
            <IntlProvider locale={locale} messages={modifiedTranslations} formats={formats}>
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
