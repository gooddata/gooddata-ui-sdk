// (C) 2019-2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { LRUCache } from "lru-cache";
import { IntlConfig, IntlProvider, IntlShape, createIntl } from "react-intl";

import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import {
    DefaultLocale,
    ILocale,
    TranslationsCustomizationProvider,
    pickCorrectMetricWordingInner,
    pickCorrectWording,
    resolveLocaleDefaultMessages,
} from "@gooddata/sdk-ui";

import { translations } from "./translations.js";

const INTL_CACHE_SIZE = 20;
const INTL_CACHE_KEY = "messages";
const intlCache = new LRUCache<string, IntlConfig>({ max: INTL_CACHE_SIZE });

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
    const strings = resolveLocaleDefaultMessages(locale, translations);

    intlCache.set(INTL_CACHE_KEY, {
        locale,
        messages: pickCorrectWording(strings, settings),
    });
    return createIntl(intlCache.get(INTL_CACHE_KEY));
}

interface IInternalIntlWrapperProps {
    locale?: string;
    workspace?: string;
    children?: ReactNode;
}

export function InternalIntlWrapper({
    locale = DefaultLocale,
    children,
    workspace,
}: IInternalIntlWrapperProps) {
    /**
     * Because of issues described in the ticket FET-855, we decided to use this workaround.
     * After the issues that are described in the ticket are solved or at least reduced,
     * this workaround can be removed.
     */
    const settings = window.gdSettings as IWorkspaceSettings;

    const strings = resolveLocaleDefaultMessages(locale, translations);

    // Memoize the modified translations using the original sdk-ui logic without the global memoization cache
    const modifiedStrings = useMemo(() => {
        const isEnabledRenamingMeasureToMetric = settings?.enableRenamingMeasureToMetric ?? true;
        return pickCorrectMetricWordingInner(strings, isEnabledRenamingMeasureToMetric);
    }, [strings, settings?.enableRenamingMeasureToMetric]);

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
                customize={() => modifiedStrings} // Pre-computed, ignore parameters
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
}
