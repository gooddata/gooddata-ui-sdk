// (C) 2019-2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { LRUCache } from "lru-cache";
import { IntlConfig, IntlProvider, IntlShape, createIntl } from "react-intl";

import { DefaultLocale, ILocale, resolveLocaleDefaultMessages } from "@gooddata/sdk-ui";

import { translations } from "./translations.js";

const INTL_CACHE_SIZE = 20;
const INTL_CACHE_KEY = "messages";
const intlCache = new LRUCache<string, IntlConfig>({ max: INTL_CACHE_SIZE });

export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    const cachedIntlConfig = intlCache.get(INTL_CACHE_KEY);
    if (cachedIntlConfig?.locale === locale) {
        return createIntl(cachedIntlConfig);
    }
    const strings = resolveLocaleDefaultMessages(locale, translations);

    intlCache.set(INTL_CACHE_KEY, {
        locale,
        messages: strings,
    });
    return createIntl(intlCache.get(INTL_CACHE_KEY));
}

interface IInternalIntlWrapperProps {
    locale?: string;
    children?: ReactNode;
}

export function InternalIntlWrapper({ locale = DefaultLocale, children }: IInternalIntlWrapperProps) {
    const messages = useMemo(() => resolveLocaleDefaultMessages(locale, translations), [locale]);

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
}
