// (C) 2019-2024 GoodData Corporation
import React, { useMemo } from "react";
import { IntlProvider, IntlShape, createIntl, IntlConfig } from "react-intl";
import {
    DefaultLocale,
    ILocale,
    pickCorrectWording,
    TranslationsCustomizationProvider,
} from "@gooddata/sdk-ui";

import { translations } from "./translations.js";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { LRUCache } from "lru-cache";

const INTL_CACHE_SIZE = 20;
const INTL_CACHE_KEY = "messages";
const intlCache = new LRUCache<string, IntlConfig>({ max: INTL_CACHE_SIZE });

function getLocaleStrings(locale) {
    const strings = translations[locale];
    if (!strings) {
        console.warn(`Missing locale strings for ${locale}, using ${DefaultLocale}`);
        return translations[DefaultLocale];
    }

    return strings;
}

export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    /**
     * Because of issues described in the ticket FET-855, we decided to use this workaround.
     * After the issues that are described in the ticket are solved or at least reduced,
     * this workaround can be removed.
     */
    const cachedIntlConfig = intlCache.get(INTL_CACHE_KEY);
    if (cachedIntlConfig?.locale === locale) {
        return createIntl(cachedIntlConfig);
    }
    const settings = window.gdSettings as IWorkspaceSettings;
    const strings = getLocaleStrings(locale);

    intlCache.set(INTL_CACHE_KEY, {
        locale,
        messages: pickCorrectWording(strings, settings),
    });
    return createIntl(intlCache.get(INTL_CACHE_KEY));
}

interface IInternalIntlWrapperProps {
    locale?: string;
    workspace?: string;
    children?: React.ReactNode;
}

export const InternalIntlWrapper: React.FC<IInternalIntlWrapperProps> = ({
    locale = DefaultLocale,
    children,
    workspace,
}) => {
    /**
     * Because of issues described in the ticket FET-855, we decided to use this workaround.
     * After the issues that are described in the ticket are solved or at least reduced,
     * this workaround can be removed.
     */
    const settings = window.gdSettings as IWorkspaceSettings;

    const strings = getLocaleStrings(locale);
    const messages = useMemo(() => pickCorrectWording(strings, settings), [strings, settings]);

    if (settings) {
        return (
            <IntlProvider locale={locale} messages={messages}>
                {children}
            </IntlProvider>
        );
    } else {
        return (
            <TranslationsCustomizationProvider
                translations={strings}
                workspace={workspace}
                render={(modifiedTranslations) => {
                    return (
                        <IntlProvider key={locale} locale={locale} messages={modifiedTranslations}>
                            {children}
                        </IntlProvider>
                    );
                }}
            />
        );
    }
};
