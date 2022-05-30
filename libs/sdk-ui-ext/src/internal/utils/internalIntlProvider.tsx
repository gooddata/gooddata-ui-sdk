// (C) 2019-2022 GoodData Corporation
import React, { useMemo } from "react";
import { IntlProvider, IntlShape, createIntl } from "react-intl";
import {
    DefaultLocale,
    ILocale,
    pickCorrectWording,
    TranslationsCustomizationProvider,
} from "@gooddata/sdk-ui";

import { translations } from "./translations";
import { IWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { LRUCache } from "@gooddata/util";

const INTL_CACHE_SIZE = 20;
const INTL_CACHE_KEY = "messages";
const intlCache = new LRUCache<Record<string, string>>({ maxSize: INTL_CACHE_SIZE });

export function createInternalIntl(locale: ILocale = DefaultLocale): IntlShape {
    /**
     * Because of issues described in the ticket FET-855, we decided to use this workaround.
     * After the issues that are described in the ticket are solved or at least reduced,
     * this workaround can be removed.
     */
    const settings = window.gdSettings as IWorkspaceSettings;
    if (!intlCache.get(INTL_CACHE_KEY)) {
        intlCache.set(INTL_CACHE_KEY, pickCorrectWording(translations[locale], settings));
    }
    return createIntl({ locale, messages: intlCache.get(INTL_CACHE_KEY) });
}

interface IInternalIntlWrapperProps {
    locale?: string;
    workspace?: string;
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

    const messages = useMemo(() => pickCorrectWording(translations[locale], settings), [locale, settings]);

    if (settings) {
        return (
            <IntlProvider locale={locale} messages={messages}>
                {children}
            </IntlProvider>
        );
    } else {
        return (
            <TranslationsCustomizationProvider
                translations={translations[locale]}
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
